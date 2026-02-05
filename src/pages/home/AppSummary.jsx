
import * as React from "react";
import {
    Box,
    Container,
    Typography,
    Stack,
    Grid,
    Card,
    CardContent,
    Chip,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
} from "@mui/material";

const AppSummary = ({ pages, title, orgName }) => {
    return (
        <Stack spacing={1.25} px={1} mb={3}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {title} —{' '}
                <Box
                    component="span"
                    sx={{
                        position: 'relative',
                        display: 'inline-block',

                        // oryginalny tekst
                        '& > .text-normal': {
                            opacity: 1,
                            transition: 'opacity 150ms ease',
                        },

                        // tekst na hover
                        '& > .text-hover': {
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            whiteSpace: 'nowrap',
                            opacity: 0,
                            transition: 'opacity 150ms ease',
                        },

                        '&:hover > .text-normal': {
                            opacity: 0,
                        },

                        '&:hover > .text-hover': {
                            opacity: 1,
                        },
                        '&::after': {
                            content: '"🍌"',
                            opacity: 0,
                            transition: 'opacity 150ms ease',
                            paddingLeft: '1em',
                        },
                        '&:hover::after': {
                            opacity: 1,
                        },
                    }}
                >
                    <span className="text-normal">bananowy</span>
                    <span className="text-hover">bazodanowy</span>
                </Box>
                <Box>most między Jira, Clockify i strukturą kosztową</Box>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 980 }}>
                {title} to narzędzie suplementarne: nie zastępuje workflow w Jira ani rejestracji czasu w Clockify.
                Porządkuje dane i spina je z organizacją oraz controllingiem, żeby dało się robić raporty przekrojowe
                (klient / grupa produktowa / wydajność pracownika) w jednym, spójnym modelu danych.
            </Typography>
        </Stack>
    );
}

export default AppSummary;  