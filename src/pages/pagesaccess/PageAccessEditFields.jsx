import React, {useState, useEffect} from "react";

import { Box } from "@mui/material";

import http from "../../http";

const defaultRwd = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//Mui

const PageAccessEditFields = ({ id = null, row = {}, rwd = defaultRwd }) => {
    const [schema, setSchema] = useState({});
    const [loading, setLoading] = useState(false);s
    
    const value = `${row.edit_restricted_fields}`.split(',');
    const endpoint = row.endpoint;
    
    const fetchSchema = async () => {
        setLoading(true);
        const {data} = await http.get(`/${endpoint}/getEntitySchema.php`);
        console.log(data);
        setLoading(false);
    }

    useEffect(()=>{
        fetchSchema();
    }, [endpoint, fetchSchema]);
    return <Box>
        {id}
    </Box>
}

export default PageAccessEditFields;