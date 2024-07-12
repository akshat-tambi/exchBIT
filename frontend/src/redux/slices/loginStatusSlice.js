import { createSlice } from "@reduxjs/toolkit";

const initialState={
    isLoggedIn:false
}

const loginStatusSlice=createSlice({
    name:'loginStatus',
    initialState,
    reducers:{
        toggle:(state)=>{
            state.isLoggedIn=true;
        }
    }
})

export default loginStatusSlice.reducer;
export const {toggle} =loginStatusSlice.actions;