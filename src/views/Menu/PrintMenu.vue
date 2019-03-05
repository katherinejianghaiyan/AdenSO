<template>
    <div>
        <img :src="this.photoUrl" />
    </div>
</template>

<script>
    export default {
        data() {
            return {
                photoUrl:""
            };
        },
        computed: {
        },
        components: {
        },
        methods: {
        },
        created() {
            this.photoUrl = "http://web.adenservices.com/adenapi/api/hr/userphoto/?employeeid=600000071";
        }
    };
</script>

<style>
    @import '../../assets/css/common.css';
</style>