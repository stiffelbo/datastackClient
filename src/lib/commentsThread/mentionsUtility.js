/**
 * MentionsUtility - A utility class responsible for handling mention detection, insertion, and deletion within a TinyMCE editor instance.
 * 
 * @param {Object} editorRef - React ref pointing to the TinyMCE editor instance.
 * @param {Array} mentionOptions - Array of available users that can be mentioned. Each user should have an id, value, and optional disabled flag.
 * @param {boolean} mentionMode - State indicating whether mention mode is active (when a ' @' pattern is detected).
 * @param {function} setMentionMode - Setter function to update the mentionMode state.
 * @param {Array} mentions - Setter function to update the mentionMode state.
 * @param {function} setMentions - Setter function to update the mentions state (list of user IDs).
 * @param {function} setMentionSuggestions - Setter function to update the mentionSuggestions state (filtered users based on search).
 * @param {function} setMentionSearch - Setter function to update the mentionSearch state (current search string after '@').
 * @param {string} mentionSearch - The current search string captured by the detectMentions method.
 */

export class MentionsUtility {
    constructor(editorRef, mentionOptions, mentionMode, setMentionMode, mentions, setMentions, setMentionSuggestions, setMentionSearch, mentionSearch, setMentionBookmark, mentionBookmark) {
        this.editorRef = editorRef;
        this.mentionOptions = mentionOptions;
        this.mentionMode = mentionMode;
        this.setMentionMode = setMentionMode;
        this.mentions = mentions;
        this.setMentions = setMentions;
        this.setMentionSuggestions = setMentionSuggestions;
        this.setMentionSearch = setMentionSearch;
        this.mentionSearch = mentionSearch;
        this.setMentionBookmark = setMentionBookmark;
        this.mentionBookmark = mentionBookmark;
        this.offset = 40;

        // Bind methods to maintain `this` context
        this.handleMentionInsert = this.handleMentionInsert.bind(this);
        this.detectMentions = this.detectMentions.bind(this);
        this.detectMentionMode = this.detectMentionMode.bind(this);
        this.monitorMentions = this.monitorMentions.bind(this);
    }

    /**
     * Check for mention mode activation by detecting ' @' pattern
     */
    detectMentionMode() {
        if (!this.editorRef.current) return;

        const editor = this.editorRef.current;
        const selection = editor.selection;
        const range = selection.getRng();

        if (!range.collapsed) return; // Ignore if text is selected

        const currentNode = range.commonAncestorContainer;
        const textAroundCursor = currentNode.textContent || '';

        const cursorOffset = range.startOffset;
        const textBeforeCursor = textAroundCursor.substring(Math.max(0, cursorOffset - this.offset), cursorOffset);

        const isSpaceTriggered = textBeforeCursor.endsWith(" @") || textBeforeCursor.endsWith("\u00A0@");
        const isNewLineTriggered = textBeforeCursor.endsWith('\n@');

        // Check for isolated @ trigger (but not part of an email pattern)
        const isolatedAtPattern = /(^|\s)@(?![\w.-]+@)/;
        const isIsolatedAtTriggered = isolatedAtPattern.test(textBeforeCursor);

        const isMentionTriggered = isSpaceTriggered || isNewLineTriggered || isIsolatedAtTriggered;

        if (isMentionTriggered) {
            this.setMentionMode(true); // Enter mention mode

            // Save current cursor position
            const editor = this.editorRef.current;
            const bookmark = editor.selection.getBookmark(2); // Save a deep bookmark to capture precise position
            this.setMentionBookmark(bookmark);

            this.detectMentions();
        }

        // Check if mentionMode is active and user typed a space after a mention phrase
        if (this.mentionMode && textBeforeCursor.match(/@\w+\s$/)) {
            this.setMentionMode(false); // Exit mention mode if phrase is completed
        }

        // Fallback mechanism: Disable mention mode if there is no '@' in textBeforeCursor
        if (!textBeforeCursor.includes('@')) {
            this.setMentionMode(false);
        }
    }
    /**
     * mention search detection
     */
    detectMentions() {
        if (!this.editorRef.current || !this.mentionMode) return; // Only proceed if mentionMode is active

        const editor = this.editorRef.current;
        const selection = editor.selection;
        const range = selection.getRng();

        if (!range.collapsed) return; // Ignore if text is selected

        const currentNode = range.commonAncestorContainer;
        const textAroundCursor = currentNode.textContent || '';

        const cursorOffset = range.startOffset;
        const textBeforeCursor = textAroundCursor.substring(Math.max(0, cursorOffset - this.offset), cursorOffset);

        // Match for text being typed after @
        const mentionSearchMatch = textBeforeCursor.match(/@([\w]*)$/);
        const searchText = mentionSearchMatch ? mentionSearchMatch[1] : '';

        // Update mentionSearch state
        this.setMentionSearch(searchText);

        // Filter available users based on search phrase or show only non-mentioned users if search is empty
        const filteredUsers = this.mentionOptions.filter(user => {
            const isUserMentioned = this.mentions.includes(user.label);

            if (searchText.trim() === '') {
                // When search text is empty, show all users not already mentioned
                return !isUserMentioned && !user.disabled;
            }

            // When search text exists, filter based on user value and mention state
            return (
                user.label.toLowerCase().includes(searchText.toLowerCase()) &&
                !isUserMentioned &&
                !user.disabled
            );
        });

        // Update suggestions state
        this.setMentionSuggestions(filteredUsers);
    }

    /* Mention HTML template */

    mentionHTML(user, mentionText) {
        return `<span class="mention" data-user-id="${user.value}" style="background-color: #ffc978ff; padding: 4px 4px; border-radius: 4px;">${mentionText}</span>&nbsp;`;
    }

    /**
     * Inserting mention into the editor
     * @param {Object} user - The user object representing the mention.
     */
    handleMentionInsert(user) {
        if (!this.editorRef.current || !this.mentionBookmark) return;

        const editor = this.editorRef.current;
        editor.focus();

        const mentionHTML = this.mentionHTML(user, `@${user.label}`);

        editor.undoManager.transact(() => {
            // Restore the cursor position to the end of the mention search phrase
            editor.selection.moveToBookmark(this.mentionBookmark);

            // Calculate how many backspace actions we need to simulate
            const searchPhrase = this.mentionSearch ? `@${this.mentionSearch}` : '@';
            const backspaceCount = searchPhrase.length;

            // Simulate backspace presses to remove the search phrase
            for (let i = 0; i < backspaceCount; i++) {
                editor.execCommand('Delete'); // Removes character to the left (like Backspace)
            }

            // Now, the cursor is right where the mention HTML should be inserted
            editor.execCommand('mceInsertContent', false, mentionHTML);
        });

        // Update mentions state
        this.setMentions(prevMentions => {
            const mentionId = String(user.value);
            if (!prevMentions.includes(mentionId)) {
                return [...prevMentions, mentionId];
            }
            return prevMentions;
        });

        // Clear all temporary states
        this.setMentionSuggestions([]);
        this.setMentionSearch(null);
        this.setMentionMode(false);
        this.setMentionBookmark(null);
    }

    /**
     * Monitor mentions in the editor and keep state consistent
     */
    monitorMentions() {
        if (!this.editorRef.current) return;

        const editor = this.editorRef.current;
        const content = editor.getContent();

        // Extract mention IDs from the editor content
        const doc = new DOMParser().parseFromString(content, 'text/html');
        const mentionElements = doc.querySelectorAll('.mention');
        const currentMentions = Array.from(mentionElements).map(el => String(el.getAttribute('data-user-id')));

        // Update mentions state properly
        this.setMentions(prevMentions => {
            // Convert all existing mentions to strings for consistency
            const prevMentionsStr = prevMentions.map(id => String(id));

            // Remove mentions that no longer exist in the content
            const filteredMentions = prevMentionsStr.filter(id => currentMentions.includes(id));

            // Add newly detected mentions to the state
            const newMentions = currentMentions.filter(id => !filteredMentions.includes(id));

            if (newMentions.length > 0) {
                // Ensure only unique mentions are stored
                const updatedMentions = Array.from(new Set([...filteredMentions, ...newMentions]));
                return updatedMentions;
            }

            return filteredMentions;
        });
    }
}