import React from 'react';
import { Paper, List, ListItem } from '@mui/material';

const MentionsOptions = ({ mentionMode, mentionSuggestions, onInsert }) => {
    if (!mentionMode || mentionSuggestions.length === 0) return null;

    return (
        <Paper elevation={3} sx={{ position: 'absolute', top: 40, right: 0, zIndex: 10 }}>
            <List>
                {mentionSuggestions.map(user => (
                    <ListItem
                        key={user.value}
                        onClick={() => onInsert(user)}
                        title={user.title || ''}
                        sx={{ cursor: 'pointer', '&:hover': { backgroundColor: "#ffc978ff" } }}
                    >
                        {user.label}
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default MentionsOptions;
