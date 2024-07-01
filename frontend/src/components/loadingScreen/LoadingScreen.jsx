import React from 'react';
import styled from 'styled-components';
import loadingGif from '../../assets/loading.gif';

const LoadingOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 1);
    z-index: 9999;
`;

const LoadingImage = styled.img`
    width: 300px;
    height: 300px;
`;

const LoadingScreen = () => 
{
    return (
        <LoadingOverlay>
            <LoadingImage src={loadingGif} alt="Loading..." />
        </LoadingOverlay>
    );
}

export default LoadingScreen;
