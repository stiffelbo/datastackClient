import { useState, useEffect } from 'react';
import http from '../../../http';

const baseEndpoint = 'jira_issue_user_logs';

export default function useJiraIssueUserLogs(){
    // UI / network state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const [lastData, setLastData] = useState(null); // Store the last data to prevent duplicate submissions

    //Async methods
    const save = async (data) =>{
        if (JSON.stringify(lastData) === JSON.stringify(data)) {
            setError(["Ten sam zestaw danych został już zapisany. Proszę wprowadzić nowe dane przed ponownym zapisaniem."]);
            return;
        }
        setLastData(data);
        setLoading(true);
        try{
            const url = `\\${baseEndpoint}\\create.php`;

            const res = await http.post(url, data);
            setResult(res);
            setLoading(false);
        }catch (err) {
            console.error('post logs error', err);
            setError(err);
            return [];
        } finally {
            setLoading(false);
        }
    }

    return {
        loading,
        error,
        result,
        //calbacks
        save,
        clear: () => {
            setError(null);
            setResult(null);
        }
    }
}