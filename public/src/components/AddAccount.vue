<template>
    <div>
        <button class="btn btn-info btn-sm" @click="showForm = !showForm">Add</button>

        <div class="form" v-if="showForm">
            <div class="form-group">
                <label>Title</label>
                <input type="text" class="form-control" v-model="event.title">
            </div>

            <div class="form-group">
                <label>Description</label>
                <input type="text" class="form-control" v-model="event.description">
            </div>

            <div class="form-group">
                <label>Date</label>
                <input type="date" class="form-control" v-model="event.date">
            </div>

            <div class="form-group">
                <label>Location</label>
                <input type="text" class="form-control" v-model="event.location">
            </div>

            <button class="btn-sm btn-primary" @click="addEvent">Submit</button>

        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                event: {
                    title: '',
                    description: '',
                    date: '',
                    location: '',
                    email: ''
                },
                showForm: false
            }
        },
        methods: {
            addEvent() {
            }
        }
    } 
</script>