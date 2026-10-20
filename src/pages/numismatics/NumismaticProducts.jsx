
import React from "react";

import {
    Box,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    CircularProgress,
    CardActions,
    Button
} from "@mui/material";


import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import useEntity from "../../hooks/useEntity";

const NumismaticProducts = ({ id, rwd }) => {
    const productEntity = useEntity({
        entityName: "NumismaticProducts",
        endpoint: "/product/",
        query: { numismatic_id: id },
    });

    const { rows = [], loading, error } = productEntity;

    const appUrl = import.meta.env.DEV
        ? import.meta.env.VITE_DEV_APP_URL
        : import.meta.env.VITE_STORAGE_URL;

    return (
        <Box
            sx={{
                pt: 2,
                height: rwd.height - 202,
                overflowY: "auto",
            }}
        >
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error" textAlign="center">
                    Nie udało się pobrać produktów.
                </Typography>
            ) : rows.length === 0 ? (
                <Typography textAlign="center" sx={{ p: 3 }}>
                    Brak produktów
                </Typography>
            ) : (
                <Grid container spacing={2}>
                    {rows.map((product) => (
                        <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <Card
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >


                                {product.profile_img ? (
                                    <CardMedia
                                        component="img"
                                        image={product.profile_img}
                                        alt={product.slug || "Produkt"}
                                        sx={{
                                            height: 180,
                                            objectFit: "contain",
                                            p: 1,
                                        }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            height: 180,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "text.disabled",
                                        }}
                                    >
                                        <ImageNotSupportedOutlinedIcon sx={{ fontSize: 64 }} />
                                    </Box>
                                )}


                                <CardContent>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            overflowWrap: "anywhere",
                                            wordBreak: "break-word",
                                            whiteSpace: "normal",
                                        }}
                                    >
                                        {product.slug}
                                    </Typography>
                                </CardContent>


                                <CardActions sx={{ mt: "auto", justifyContent: "flex-end", p: 1 }}>
                                    <Button
                                        size="small"
                                        variant="text"
                                        endIcon={<OpenInNewIcon />}
                                        component="a"
                                        href={`${appUrl.replace(/\/$/, "")}/product/${product.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Otwórz produkt
                                    </Button>
                                </CardActions>

                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default NumismaticProducts;
