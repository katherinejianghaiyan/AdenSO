<template>
    <div>
        <transition name="fade" mode="out-in">
            <router-view></router-view>
        </transition>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                show1: true
            }
        },
        mounted() {
        }
    }

</script>