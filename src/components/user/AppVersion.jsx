import React from "react";

const AppVersion = () => {
    return (
        <span style={{paddingBottom: '8px', fontSize: '0.8em'}}>{import.meta.env.VITE_APP_NAME} v:{import.meta.env.VITE_APP_VERSION}</span>
    );
}

export default AppVersion;