<template>
    <div class="loader">
    </div>
</template>

<style>
    .loader {
        width: 100px;
        height: 100px;
        margin: auto;
        background: url('/images/touch/favicon512.png') center center no-repeat;
        -webkit-animation: loader-rotation 2s linear infinite;
        -moz-animation: loader-rotation 2s linear infinite;
        -o-animation: loader-rotation 2s linear infinite;
        -ms-animation: loader-rotation 2s linear infinite;
        animation: loader-rotation 2s linear infinite;
        -webkit-background-size: 100%;
        -moz-background-size: 100%;
        background-size: 100%;
    }
    @-moz-keyframes loader-rotation {
        from {
            -webkit-transform: rotate(360deg);
            -moz-transform: rotate(360deg);
            -o-transform: rotate(360deg);
            -ms-transform: rotate(360deg);
            transform: rotate(360deg);
        }
        to {
            -webkit-transform: rotate(0deg);
            -moz-transform: rotate(0deg);
            -o-transform: rotate(0deg);
            -ms-transform: rotate(0deg);
            transform: rotate(0deg);
        }
    }
    @-webkit-keyframes loader-rotation {
        from {
            -webkit-transform: rotate(360deg);
            -moz-transform: rotate(360deg);
            -o-transform: rotate(360deg);
            -ms-transform: rotate(360deg);
            transform: rotate(360deg);
        }
        to {
            -webkit-transform: rotate(0deg);
            -moz-transform: rotate(0deg);
            -o-transform: rotate(0deg);
            -ms-transform: rotate(0deg);
            transform: rotate(0deg);
        }
    }
    @-o-keyframes loader-rotation {
        from {
            -webkit-transform: rotate(360deg);
            -moz-transform: rotate(360deg);
            -o-transform: rotate(360deg);
            -ms-transform: rotate(360deg);
            transform: rotate(360deg);
        }
        to {
            -webkit-transform: rotate(0deg);
            -moz-transform: rotate(0deg);
            -o-transform: rotate(0deg);
            -ms-transform: rotate(0deg);
            transform: rotate(0deg);
        }
    }
    @keyframes loader-rotation {
        from {
            -webkit-transform: rotate(360deg);
            -moz-transform: rotate(360deg);
            -o-transform: rotate(360deg);
            -ms-transform: rotate(360deg);
            transform: rotate(360deg);
        }
        to {
            -webkit-transform: rotate(0deg);
            -moz-transform: rotate(0deg);
            -o-transform: rotate(0deg);
            -ms-transform: rotate(0deg);
            transform: rotate(0deg);
        }
    }
</style>