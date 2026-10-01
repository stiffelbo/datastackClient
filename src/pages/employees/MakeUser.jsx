import React, { useState } from "react";

import {
    Button,
    Box,
    Alert,
    LinearProgress
} from "@mui/material";

import http from "../../http";

import { useAuth } from "../../context/AuthContext";


const generateTemporaryPassword = (firstName) => {
    const name = String(firstName || "")
        .trim()
        .replace(/\s+/g, "");

    const now = new Date();

    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    // np. Jan + 0925 + 3 = Jan09253
    return `${name}${month}${day}${name.length}`;
};


const makeRegisterData = (data) => {
    const pass = generateTemporaryPassword(data.first_name);

    return {
        email: data.email,
        password: pass,
        confirm: pass,
        first_name: data.first_name,
        last_name: data.last_name,
        employee_id: data.id,
    };
};


const url = "auth/register.php";


const MakeUser = ({ data }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [createdPassword, setCreatedPassword] = useState(null);

    const auth = useAuth();
    const role = auth?.user?.userData?.role;
    
    if(role !== 'admin') return;

    const makeUser = async () => {
        try {
            setLoading(true);
            setError(null);

            const payload = makeRegisterData(data);

            await http.post(url, payload);

            setCreatedPassword(payload.password);
        } catch (error) {
            console.error(error);

            setError(
                error?.response?.data?.message ||
                "Nie udało się utworzyć użytkownika."
            );
        } finally {
            setLoading(false);
        }
    };


    if (data.user_id) {
        return (
            <Alert severity="warning">
                Nie można utworzyć użytkownika — pracownik posiada już konto.
            </Alert>
        );
    }


    if (loading) {
        return <LinearProgress />;
    }


    return (
        <Box mb={4}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {createdPassword ? (
                <Alert severity="success">
                    Użytkownik został utworzony.
                    Tymczasowe hasło: <strong>{createdPassword}</strong>
                </Alert>
            ) : (
                <Alert
                    severity="info"
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={makeUser}
                        >
                            Utwórz
                        </Button>
                    }
                >
                    Utwórz użytkownika dla pracownika:{" "}
                    <strong>
                        {data.first_name} {data.last_name}
                    </strong>
                </Alert>
            )}
        </Box>
    );
};


export default MakeUser;