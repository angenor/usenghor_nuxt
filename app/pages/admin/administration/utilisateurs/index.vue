<script setup lang="ts">
import { useUsersManagement } from './composables/useUsersManagement'
import UsersStatisticsPanel from './components/UsersStatisticsPanel.vue'
import UsersFiltersPanel from './components/UsersFiltersPanel.vue'
import UsersTable from './components/UsersTable.vue'
import UserDetailModal from './components/UserDetailModal.vue'
import UserFormModal from './components/UserFormModal.vue'
import UserDeleteConfirmModal from './components/UserDeleteConfirmModal.vue'
import UserPasswordResetModal from './components/UserPasswordResetModal.vue'

definePageMeta({
  layout: 'admin',
})

const {
  // State
  isLoading,
  users,
  selectedUser,
  roleOptions,
  showDetailModal,
  showCreateModal,
  showFilters,
  showStatistics,
  showDeleteConfirm,
  showPasswordModal,
  userToDelete,
  temporaryPassword,
  currentPage,
  totalItems,
  totalPages,
  filters,
  isEditing,
  isSaving,
  formErrors,
  formData,
  selectedUserIds,

  // Photo upload state
  pendingPhotoFile,
  showPhotoEditor,
  isUploadingPhoto,
  photoPreviewUrl,

  // Computed
  statistics,
  hasActiveFilters,
  allSelected,
  someSelected,

  // Methods
  loadData,
  viewUserDetail,
  openCreateModal,
  openEditModal,
  saveUser,
  confirmDelete,
  handleDeleteUser,
  toggleUserActive,
  handleResetPassword,
  handleVerifyEmail,
  handleBulkAction,
  clearFilters,
  goToPage,
  toggleSelectAll,
  toggleUserSelection,

  // Photo upload methods
  handlePhotoUpload,
  saveEditedPhoto,
  cancelPhotoEditor,
  removePhoto,

  // From useUsersApi
  getFullName,
  formatLastLogin,
  getRoleColor,
  salutationOptions,
  userStatusColors,
  verificationColors,
} = useUsersManagement()

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Utilisateurs
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestion des comptes utilisateurs et de leurs accès
        </p>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          @click="showStatistics = !showStatistics"
        >
          <font-awesome-icon :icon="['fas', 'chart-bar']" class="h-4 w-4" />
          Statistiques
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          @click="showFilters = !showFilters"
        >
          <font-awesome-icon :icon="['fas', 'filter']" class="h-4 w-4" />
          Filtres
          <span
            v-if="hasActiveFilters"
            class="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs text-white"
          >
            !
          </span>
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          @click="openCreateModal"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
          Nouvel utilisateur
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <template v-else>
      <!-- Statistics Panel -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <UsersStatisticsPanel v-if="showStatistics" :statistics="statistics" />
      </Transition>

      <!-- Filters Panel -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <UsersFiltersPanel
          v-if="showFilters"
          v-model:filters="filters"
          :role-options="roleOptions"
          :has-active-filters="hasActiveFilters"
          @clear="clearFilters"
        />
      </Transition>

      <!-- Results count & bulk actions -->
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ totalItems }} utilisateur{{ totalItems > 1 ? 's' : '' }}
          <span v-if="selectedUserIds.length > 0" class="ml-2 font-medium text-primary-600 dark:text-primary-400">
            ({{ selectedUserIds.length }} sélectionné{{ selectedUserIds.length > 1 ? 's' : '' }})
          </span>
        </p>
        <div v-if="selectedUserIds.length > 0" class="flex gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            @click="handleBulkAction('activate')"
          >
            <font-awesome-icon :icon="['fas', 'check']" class="h-3 w-3" />
            Activer
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            @click="handleBulkAction('deactivate')"
          >
            <font-awesome-icon :icon="['fas', 'ban']" class="h-3 w-3" />
            Désactiver
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-600 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900/20"
            @click="handleBulkAction('delete')"
          >
            <font-awesome-icon :icon="['fas', 'trash']" class="h-3 w-3" />
            Supprimer
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            @click="selectedUserIds = []"
          >
            Désélectionner
          </button>
        </div>
      </div>

      <!-- Users Table -->
      <UsersTable
        :users="users"
        :selected-user-ids="selectedUserIds"
        :all-selected="allSelected"
        :some-selected="someSelected"
        :current-page="currentPage"
        :total-pages="totalPages"
        :get-full-name="getFullName"
        :format-last-login="formatLastLogin"
        :get-role-color="getRoleColor"
        :user-status-colors="userStatusColors"
        :verification-colors="verificationColors"
        @toggle-select-all="toggleSelectAll"
        @toggle-selection="toggleUserSelection"
        @view-detail="viewUserDetail"
        @edit="openEditModal"
        @toggle-active="toggleUserActive"
        @verify-email="handleVerifyEmail"
        @reset-password="handleResetPassword"
        @delete="confirmDelete"
        @go-to-page="goToPage"
      />
    </template>

    <!-- Modals -->
    <UserDetailModal
      :show="showDetailModal"
      :user="selectedUser"
      :get-full-name="getFullName"
      :format-last-login="formatLastLogin"
      :get-role-color="getRoleColor"
      :user-status-colors="userStatusColors"
      :verification-colors="verificationColors"
      @close="showDetailModal = false"
      @edit="openEditModal"
    />

    <UserFormModal
      :show="showCreateModal"
      :is-editing="isEditing"
      :is-saving="isSaving"
      :form-data="formData"
      :form-errors="formErrors"
      :role-options="roleOptions"
      :salutation-options="salutationOptions"
      :get-role-color="getRoleColor"
      :pending-photo-file="pendingPhotoFile"
      :show-photo-editor="showPhotoEditor"
      :is-uploading-photo="isUploadingPhoto"
      :photo-preview-url="photoPreviewUrl"
      @close="showCreateModal = false"
      @save="saveUser"
      @update:form-data="formData = $event"
      @photo-upload="handlePhotoUpload"
      @photo-save="saveEditedPhoto"
      @photo-cancel="cancelPhotoEditor"
      @photo-remove="removePhoto"
    />

    <UserDeleteConfirmModal
      :show="showDeleteConfirm"
      :user="userToDelete"
      :is-saving="isSaving"
      :get-full-name="getFullName"
      @close="showDeleteConfirm = false"
      @confirm="handleDeleteUser"
    />

    <UserPasswordResetModal
      :show="showPasswordModal"
      :temporary-password="temporaryPassword"
      @close="showPasswordModal = false"
    />
  </div>
</template>
