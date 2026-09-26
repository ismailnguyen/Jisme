<template>
    <div class="loader loader-animate"></div>
</template>

<style>
    .loader {
        width: 100px;
        height: 100px;
        margin: auto;
        background: url('/images/icons/icon_512.png') center center no-repeat;
        background-size: 100%;
    }

    .loader-animate {
        animation: loader-rotation 2s linear infinite;
    }

    @-moz-keyframes loader-rotation {
        from {
            transform: rotate(360deg);
        }
        to {
            transform: rotate(0deg);
        }
    }
    @-webkit-keyframes loader-rotation {
        from {
            transform: rotate(360deg);
        }
        to {
            transform: rotate(0deg);
        }
    }
    @-o-keyframes loader-rotation {
        from {
            transform: rotate(360deg);
        }
        to {
            transform: rotate(0deg);
        }
    }
    @keyframes loader-rotation {
        from {
            transform: rotate(360deg);
        }
        to {
            transform: rotate(0deg);
        }
    }
</style>