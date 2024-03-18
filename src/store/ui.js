import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const store = defineStore('ui', () => {
    const isMenuOpened = ref(false)
    const isAddAccountModalOpened = ref(false)
    const isEditAccountModalOpened = ref(false)
    const isSettingsOpened = ref(false)
    const isTagsOpened = ref(false)
    const currentEditingAccount = ref(null)

    const isAccountOpened = computed(() => {
        return isAddAccountModalOpened.value == true
            || isEditAccountModalOpened.value == true
    })

    const toggleMenu = () => {
        isMenuOpened.value = !isMenuOpened.value
    }

    const openSettings = () => {
        isSettingsOpened.value = true
    }

    const closeSettings = () => {
        isSettingsOpened.value = false
    }

    const openTags = () => {
        isTagsOpened.value = true
    }

    const closeTags = () => {
        isTagsOpened.value = false
    }

    const openAddAccountModal = () => {
        isAddAccountModalOpened.value = true
    }

    const closeAddAccountModal = () => {
        isAddAccountModalOpened.value = false
    }

    const openEditAccountModal = (account) => {
        currentEditingAccount.value = account
        isEditAccountModalOpened.value = true
    }

    const closeEditAccountModal = () => {
        isEditAccountModalOpened.value = false
        currentEditingAccount.value = null
    }

    return {    
        isMenuOpened,
        toggleMenu,

        isAccountOpened,

        isAddAccountModalOpened,
        openAddAccountModal,
        closeAddAccountModal,

        currentEditingAccount,
        isEditAccountModalOpened,
        openEditAccountModal,
        closeEditAccountModal,

        isSettingsOpened,
        openSettings,
        closeSettings,

        isTagsOpened,
        openTags,
        closeTags
    }
})

export default store