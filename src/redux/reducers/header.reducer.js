import { createSlice } from '@reduxjs/toolkit';
import { cloneDeep } from 'lodash';

export const defaultState = {
    title: ''
};

export const headerSlice = createSlice({
    name: 'header',
    initialState: cloneDeep(defaultState),
    reducers: {
        setHeaderTitle: (state, { payload }) => {
            // console.log('payload from setHeaderTitle', payload)
            state.title = payload;
        },
        clearHeaderState: (state) => {
            return cloneDeep(defaultState);
        },
    }
});

export const {
    setHeaderTitle, clearHeaderState,
} = headerSlice.actions;

export default headerSlice.reducer;
