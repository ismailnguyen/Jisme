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
        animation: loader-rotation 2s linear infinite;
        background-size: 100%;
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