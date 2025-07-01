import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, IconButton, List, ListItem, ListItemText, Grid, Box, Alert, TextField } from '@mui/material';
import { ArrowForward, AddCircleOutline, Clear } from '@mui/icons-material';
import _ from 'lodash';

// Helper function to sort and prepare data
const prepareData = (data, groupByField, idField, labelFields, titleField) => {
    if (!Array.isArray(data)) {
        throw new Error('Data is not a valid array.');
    }

    const groupedData = data.reduce((acc, item) => {
        const group = item[groupByField];
        if (!acc[group]) acc[group] = [];
        const label = labelFields.map(field => item[field]).join(' - ');
        acc[group].push({ id: item[idField], label, title: item[titleField] });
        return acc;
    }, {});

    const groupKeys = Object.keys(groupedData).sort((a, b) => a.localeCompare(b));
    groupKeys.forEach(group => {
        groupedData[group] = groupedData[group].sort((a, b) => a.label.localeCompare(b.label));
    });

    return { groupedData, groupKeys };
};

const TwoPhasePicker = ({ data, onSelect, disable, groupByField, idField, labelFields, titleField }) => {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [phrase, setPhrase] = useState('');
    const [filteredData, setFilteredData] = useState(data);

    useEffect(() => {
        setFilteredData(data);
    }, [data]);

    const { groupedData, groupKeys, error } = useMemo(() => {
        try {
            if (!phrase && (!Array.isArray(filteredData) || !filteredData.length)) {
                throw new Error('Data array is empty.');
            }
            const result = prepareData(filteredData, groupByField, idField, labelFields, titleField);
            return { ...result, error: null };
        } catch (e) {
            return { groupedData: {}, groupKeys: [], error: e.message };
        }
    }, [filteredData, groupByField, idField, labelFields, titleField, phrase]);

    const handleGroupSelect = (group) => {
        if (selectedGroup === group) {
            setSelectedGroup(null);
        } else {
            setSelectedGroup(group);
        }
    };

    const handleItemSelect = (item) => {
        if (!disable) {
            onSelect(item.id);
        }
    };

    const filterData = (searchPhrase) => {
        const lowercasedPhrase = searchPhrase.toLowerCase();
        const filtered = data.filter(item =>
            labelFields.some(field => item[field].toLowerCase().includes(lowercasedPhrase))
        );
        setFilteredData(filtered);
    };

    const debouncedFilterData = useCallback(_.debounce(filterData, 300), [data]);

    const handleSearchChange = (event) => {
        const searchPhrase = event.target.value;
        setPhrase(searchPhrase);
        debouncedFilterData(searchPhrase);
    };

    const clearFilters = () => {
        setPhrase('');
        setFilteredData(data);
    };

    const renderMenu = () => (
        <Grid container spacing={2}>
            <Grid item md={10}>
                <TextField
                    type='text'
                    size="small"
                    variant='outlined'
                    value={phrase}
                    onChange={handleSearchChange}
                    placeholder="Search..."
                    fullWidth
                />
            </Grid>
            <Grid item md={2} style={{ textAlign: 'right' }}>
                <IconButton size="small" color={phrase ? 'secondary' : 'default'} title="Clear Filters" onClick={clearFilters}>
                    <Clear />
                </IconButton>
            </Grid>
        </Grid>
    );

    const renderGroups = () => (
        <Card>
            <CardContent>
                {renderMenu()}
                <List>
                    {groupKeys.map((group, idx) => (
                        <ListItem key={`${group} ${idx}`} onClick={() => handleGroupSelect(group)} sx={{ backgroundColor: group === selectedGroup ? 'lightgray' : 'inherit' }}>
                            <IconButton disabled={disable} color={group === selectedGroup ? 'primary' : 'default'}>
                                <ArrowForward />
                            </IconButton>
                            <ListItemText primary={group} />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );

    const renderItems = () => {
        if(selectedGroup && groupedData[selectedGroup] && groupedData[selectedGroup].length){
            return <Card>
            <CardContent>
                <List>
                    {
                        groupedData[selectedGroup].map((item, idx) => (
                            <ListItem key={`${item.id} ${idx}`} button onClick={() => handleItemSelect(item)}>
                                <IconButton disabled={disable}>
                                    <AddCircleOutline />
                                </IconButton>
                                <ListItemText primary={item.label} secondary={item.title} />
                            </ListItem>
                        ))
                   }
                </List>
            </CardContent>
        </Card>
        }        
    };

    if (error && !phrase) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    {renderGroups()}
                </Grid>
                <Grid item xs={6}>
                    {renderItems()}
                </Grid>
            </Grid>
        </Box>
    );
};

export default TwoPhasePicker;
