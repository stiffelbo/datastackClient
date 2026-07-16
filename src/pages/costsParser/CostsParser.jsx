import React, {
    useCallback,
    useMemo,
    useState,
} from 'react';

import {
    Alert,
    Box,
    Grid,
    Snackbar,
} from '@mui/material';

import { useRwd } from '../../context/RwdContext';

import TopBar from './TopBar';

import PowerTable from '../../components/powerTable/powerTable';

import {
    createCostsParser,
    parserVersions,
} from './parsers/parserRegistry';

const CostsParser = () => {
    const [files, setFiles] = useState([]);

    const [selectedVersion, setSelectedVersion] = useState(
        parserVersions[0]?.id ?? ''
    );

    const [costsData, setCostsData] = useState([]);
    const [issueData, setIssueData] = useState([]);

    const [parseErrors, setParseErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState(null);

    const { height } = useRwd();

    const parser = useMemo(
        () => createCostsParser(selectedVersion),
        [selectedVersion]
    );

    const handleFilesChange = useCallback((selectedFiles) => {
        setFiles(selectedFiles);
        setCostsData([]);
        setIssueData([]);
        setParseErrors([]);
    }, []);

    const handleClear = useCallback(() => {
        setFiles([]);
        setCostsData([]);
        setIssueData([]);
        setParseErrors([]);
        setMessage(null);
    }, []);

    const handleParse = useCallback(async () => {
        if (files.length === 0) {
            return;
        }

        setLoading(true);
        setParseErrors([]);

        try {
            const result = await parser.parseFiles(files);

            setCostsData(result.costs);
            setIssueData(result.issues);
            setParseErrors(result.errors);

            setMessage({
                severity:
                    result.errors.length > 0
                        ? 'warning'
                        : 'success',

                text:
                    `Przetworzono ${result.stats.filesCount} plików. ` +
                    `Znaleziono ${result.stats.costsCount} kosztów ` +
                    `dla ${result.stats.issuesCount} projektów.`,
            });
        } catch (error) {
            console.error(error);

            setMessage({
                severity: 'error',
                text:
                    error instanceof Error
                        ? error.message
                        : String(error),
            });
        } finally {
            setLoading(false);
        }
    }, [files, parser]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <TopBar
                versions={parserVersions}
                selectedVersion={selectedVersion}
                onVersionChange={setSelectedVersion}
                files={files}
                onFilesChange={handleFilesChange}
                onParse={handleParse}
                onClear={handleClear}
                loading={loading}
            />

            {parseErrors.length > 0 && (
                <Alert
                    severity="warning"
                    sx={{ m: 1 }}
                >
                    Nie udało się przetworzyć części plików:
                    {' '}
                    {parseErrors
                        .map((error) =>
                            `${error.source_file}: ${error.message}`
                        )
                        .join(' | ')}
                </Alert>
            )}

                    <PowerTable
                        entityName="CostsParser_Costs"
                        data={costsData}
                        height={800}
                    />
                    <PowerTable
                        entityName="CostsParser_Issue"
                        data={issueData}
                        height={800}
                    />
 
            <Snackbar
                open={message !== null}
                autoHideDuration={6000}
                onClose={() => setMessage(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
            >
                {message && (
                    <Alert
                        severity={message.severity}
                        onClose={() => setMessage(null)}
                        variant="filled"
                    >
                        {message.text}
                    </Alert>
                )}
            </Snackbar>
        </Box>
    );
};

export default CostsParser;