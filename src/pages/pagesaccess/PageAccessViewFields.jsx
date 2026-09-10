import React, {useState, useEffect} from "react";

import { Box } from "@mui/material";

import http from "../../http";
import FieldsAccessControl from "./FieldsAccessControl";

const defaultRwd = {
    width: window.innerWidth,
  height: window.innerHeight,
};

//Mui

const PageAccessViewFields = ({ id = null, row = {}, rwd = defaultRwd, entity = {} }) => {

    const [schema, setSchema] = useState({});
    const [loading, setLoading] = useState(false);
    
    const endpoint = row.endpoint;
    
    const fetchSchema = async () => {
        setLoading(true);
        const {data} = await http.get(`/${endpoint}/getEntitySchema.php`);
        setSchema(data);
        setLoading(false);
    }
    
    useEffect(()=>{
        fetchSchema();
    }, [endpoint]);

    const value = `${row.view_restricted_fields}`.split(',');
    const fields = schema.columns || [];
    const onSubmit = ({id,field,value}) => entity.updateField({id,field,value});

    return <Box>
        {id}
        <FieldsAccessControl 
            value={value}
            schema={fields}
            onSubmit={onSubmit}
        />
    </Box>
}

export default PageAccessViewFields;