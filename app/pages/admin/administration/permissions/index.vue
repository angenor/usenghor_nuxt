<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Permissions
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestion des permissions et de la matrice permissions/rôles
        </p>
      </div>
      <div class="flex gap-2">
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle permission
        </button>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total permissions</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Catégories</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.categories_count }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Rôles actifs</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.active_roles }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total rôles</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.roles_count }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Onglets -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="-mb-px flex gap-4">
        <button
          @click="activeTab = 'list'"
          :class="[
            'py-2 px-4 border-b-2 font-medium text-sm transition-colors',
            activeTab === 'list'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
        >
          Liste des permissions
        </button>
        <button
          @click="activeTab = 'matrix'"
          :class="[
            'py-2 px-4 border-b-2 font-medium text-sm transition-colors',
            activeTab === 'matrix'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
        >
          Matrice permissions / rôles
        </button>
      </nav>
    </div>

    <!-- Contenu selon l'onglet -->
    <div v-if="activeTab === 'list'">
      <!-- Filtres -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Recherche -->
          <div class="flex-1">
            <label for="search" class="sr-only">Rechercher</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                v-model="filters.search"
                type="text"
                placeholder="Rechercher par code ou nom..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Filtre catégorie -->
          <div class="w-full sm:w-48">
            <label for="category" class="sr-only">Catégorie</label>
            <select
              id="category"
              v-model="filters.category"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Toutes les catégories</option>
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ permissionCategoryLabels[cat] || cat }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Vue groupée par catégorie -->
      <div class="space-y-6">
        <div
          v-for="category in filteredPermissionsByCategory"
          :key="category.code"
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <!-- En-tête catégorie -->
          <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ category.name }}
                </span>
                <span class="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full">
                  {{ category.permissions.length }} permission{{ category.permissions.length > 1 ? 's' : '' }}
                </span>
              </div>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ category.code }}
              </span>
            </div>
          </div>

          <!-- Liste des permissions de la catégorie -->
          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            <div
              v-for="permission in category.permissions"
              :key="permission.id"
              class="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3">
                    <code class="px-2 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                      {{ permission.code }}
                    </code>
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ permission.name_fr }}
                    </span>
                  </div>
                  <p v-if="getPermissionDescription(permission.id)" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {{ getPermissionDescription(permission.id) }}
                  </p>
                </div>
                <div class="flex items-center gap-4 ml-4">
                  <span class="text-sm text-gray-500 dark:text-gray-400">
                    {{ permission.roles_count }} rôle{{ permission.roles_count > 1 ? 's' : '' }}
                  </span>
                  <div class="flex gap-2">
                    <button
                      @click="openEditModal(getPermissionById(permission.id)!)"
                      class="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Modifier"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="openDeleteConfirmation(getPermissionById(permission.id)!)"
                      class="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Supprimer"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message si aucun résultat -->
        <div
          v-if="filteredPermissionsByCategory.length === 0"
          class="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 text-center"
        >
          <svg class="mx-auto w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Aucune permission trouvée
          </h3>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Essayez de modifier vos critères de recherche.
          </p>
        </div>
      </div>
    </div>

    <!-- Matrice permissions / rôles -->
    <div v-if="activeTab === 'matrix'" class="space-y-4">
      <!-- Info -->
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="text-sm text-blue-800 dark:text-blue-200">
            <p class="font-medium">À propos de la matrice</p>
            <p class="mt-1">Le <strong>Super administrateur</strong> possède automatiquement toutes les permissions. Les modifications de la matrice sont enregistrées automatiquement.</p>
          </div>
        </div>
      </div>

      <!-- Matrice -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th scope="col" class="sticky left-0 z-10 bg-gray-50 dark:bg-gray-700/50 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                  Permission
                </th>
                <th
                  v-for="role in matrix.roles"
                  :key="role.id"
                  scope="col"
                  class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                >
                  <div class="flex flex-col items-center gap-1">
                    <span>{{ role.name_fr }}</span>
                    <code class="text-[10px] font-normal text-gray-400 dark:text-gray-500">{{ role.code }}</code>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <template v-for="category in matrix.categories" :key="category.code">
                <!-- Ligne de catégorie -->
                <tr class="bg-gray-100 dark:bg-gray-700">
                  <td
                    :colspan="matrix.roles.length + 1"
                    class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {{ category.name }}
                  </td>
                </tr>
                <!-- Permissions de la catégorie -->
                <tr
                  v-for="permission in category.permissions"
                  :key="permission.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                >
                  <td class="sticky left-0 z-10 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                    <div class="flex flex-col">
                      <span class="font-medium">{{ permission.name_fr }}</span>
                      <code class="text-xs text-gray-500 dark:text-gray-400">{{ permission.code }}</code>
                    </div>
                  </td>
                  <td
                    v-for="role in matrix.roles"
                    :key="role.id"
                    class="px-4 py-2 text-center"
                  >
                    <div class="flex justify-center">
                      <template v-if="role.code === 'super_admin'">
                        <!-- Super admin - toujours actif, non modifiable -->
                        <span class="inline-flex items-center justify-center w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded" title="Super admin - Toutes les permissions">
                          <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      </template>
                      <template v-else>
                        <!-- Checkbox pour les autres rôles -->
                        <button
                          @click="togglePermission(role.id, permission.id)"
                          :class="[
                            'w-6 h-6 rounded border-2 flex items-center justify-center transition-colors',
                            permission.roles.includes(role.id)
                              ? 'bg-primary-600 border-primary-600 text-white'
                              : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                          ]"
                        >
                          <svg
                            v-if="permission.roles.includes(role.id)"
                            class="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      </template>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal création -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="showCreateModal = false"
      >
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 transition-opacity" @click="showCreateModal = false" />
          <div class="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Nouvelle permission
              </h3>
            </div>
            <form @submit.prevent="createPermission" class="p-6 space-y-4">
              <!-- Code -->
              <div>
                <label for="create-code" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Code <span class="text-red-500">*</span>
                </label>
                <input
                  id="create-code"
                  v-model="createForm.code"
                  type="text"
                  required
                  placeholder="category.action (ex: projects.view)"
                  class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Format: catégorie.action (ex: users.view, programs.create)
                </p>
                <p v-if="createFormErrors.code" class="mt-1 text-xs text-red-500">
                  {{ createFormErrors.code }}
                </p>
              </div>

              <!-- Nom français -->
              <div>
                <label for="create-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom français <span class="text-red-500">*</span>
                </label>
                <input
                  id="create-name"
                  v-model="createForm.name_fr"
                  type="text"
                  required
                  placeholder="Voir les projets"
                  class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <!-- Catégorie -->
              <div>
                <label for="create-category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie <span class="text-red-500">*</span>
                </label>
                <select
                  id="create-category"
                  v-model="createForm.category"
                  required
                  class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">
                    {{ permissionCategoryLabels[cat] || cat }}
                  </option>
                </select>
              </div>

              <!-- Description -->
              <div>
                <label for="create-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="create-description"
                  v-model="createForm.description"
                  rows="3"
                  placeholder="Description de la permission..."
                  class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              <div class="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  @click="showCreateModal = false"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal modification -->
    <Teleport to="body">
      <div
        v-if="showEditModal && editingPermission"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="showEditModal = false"
      >
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 transition-opacity" @click="showEditModal = false" />
          <div class="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Modifier la permission
              </h3>
            </div>
            <form @submit.prevent="updatePermission" class="p-6 space-y-4">
              <!-- Code (lecture seule) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Code
                </label>
                <div class="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <code class="text-sm text-gray-600 dark:text-gray-400">{{ editingPermission.code }}</code>
                </div>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Le code ne peut pas être modifié (utilisé dans le code source)
                </p>
              </div>

              <!-- Nom français -->
              <div>
                <label for="edit-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom français <span class="text-red-500">*</span>
                </label>
                <input
                  id="edit-name"
                  v-model="editForm.name_fr"
                  type="text"
                  required
                  class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <!-- Description -->
              <div>
                <label for="edit-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  v-model="editForm.description"
                  rows="3"
                  placeholder="Description de la permission..."
                  class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              <!-- Rôles utilisant cette permission -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rôles utilisant cette permission
                </label>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="role in getRolesForPermission(editingPermission.id)"
                    :key="role.id"
                    class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full"
                  >
                    {{ role.name_fr }}
                  </span>
                  <span
                    v-if="getRolesForPermission(editingPermission.id).length === 0"
                    class="text-sm text-gray-500 dark:text-gray-400"
                  >
                    Aucun rôle n'utilise cette permission
                  </span>
                </div>
              </div>

              <div class="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  @click="showEditModal = false"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal confirmation suppression -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && deletingPermission"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="showDeleteModal = false"
      >
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 transition-opacity" @click="showDeleteModal = false" />
          <div class="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl">
            <div class="p-6">
              <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full">
                <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white text-center">
                Supprimer la permission
              </h3>
              <p class="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                Êtes-vous sûr de vouloir supprimer la permission
                <strong class="text-gray-900 dark:text-white">{{ deletingPermission.name_fr }}</strong> ?
              </p>

              <!-- Avertissement si utilisée -->
              <div
                v-if="deleteCheckResult && !deleteCheckResult.canDelete"
                class="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
              >
                <div class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p class="text-sm text-amber-800 dark:text-amber-200">
                    {{ deleteCheckResult.reason }}
                  </p>
                </div>
              </div>

              <div class="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  @click="showDeleteModal = false"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  @click="deletePermission"
                  :disabled="deleteCheckResult && !deleteCheckResult.canDelete"
                  :class="[
                    'px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
                    deleteCheckResult && !deleteCheckResult.canDelete
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  ]"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import type { Permission } from '@bank/mock-data/admin-permissions'
import {
  mockPermissions,
  mockRoles,
  mockRolePermissions,
  permissionCategoryLabels,
  getAllPermissions,
  getPermissionById as getPermissionByIdFromMock,
  getPermissionsByCategory,
  getPermissionCategories,
  getPermissionMatrix,
  getPermissionStats,
  getRolesByPermission,
  isPermissionCodeTaken,
  validatePermissionCode,
  canDeletePermission,
  generatePermissionId
} from '@bank/mock-data/admin-permissions'

// Meta
definePageMeta({
  layout: 'admin'
})

// État
const activeTab = ref<'list' | 'matrix'>('list')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingPermission = ref<Permission | null>(null)
const deletingPermission = ref<Permission | null>(null)
const deleteCheckResult = ref<{ canDelete: boolean; reason?: string } | null>(null)

// Filtres
const filters = reactive({
  search: '',
  category: ''
})

// Formulaires
const createForm = reactive({
  code: '',
  name_fr: '',
  category: '',
  description: ''
})

const createFormErrors = reactive({
  code: ''
})

const editForm = reactive({
  name_fr: '',
  description: ''
})

// Données
const stats = computed(() => getPermissionStats())
const categories = computed(() => getPermissionCategories())
const matrix = computed(() => getPermissionMatrix())

const filteredPermissionsByCategory = computed(() => {
  return getPermissionsByCategory({
    search: filters.search || undefined,
    category: filters.category || undefined
  })
})

// Fonctions utilitaires
const getPermissionById = (id: string) => getPermissionByIdFromMock(id)

const getPermissionDescription = (id: string) => {
  const permission = mockPermissions.find(p => p.id === id)
  return permission?.description || null
}

const getRolesForPermission = (permissionId: string) => {
  return getRolesByPermission(permissionId)
}

// Actions
const openEditModal = (permission: Permission) => {
  editingPermission.value = permission
  editForm.name_fr = permission.name_fr
  editForm.description = permission.description || ''
  showEditModal.value = true
}

const openDeleteConfirmation = (permission: Permission) => {
  deletingPermission.value = permission
  deleteCheckResult.value = canDeletePermission(permission.id)
  showDeleteModal.value = true
}

const validateCreateForm = (): boolean => {
  createFormErrors.code = ''

  // Valider le format du code
  if (!validatePermissionCode(createForm.code)) {
    createFormErrors.code = 'Format invalide. Utilisez le format: catégorie.action'
    return false
  }

  // Vérifier si le code existe déjà
  if (isPermissionCodeTaken(createForm.code)) {
    createFormErrors.code = 'Ce code est déjà utilisé'
    return false
  }

  return true
}

const createPermission = () => {
  if (!validateCreateForm()) return

  // Simulation de création
  const newPermission: Permission = {
    id: generatePermissionId(),
    code: createForm.code.toLowerCase(),
    name_fr: createForm.name_fr,
    description: createForm.description || null,
    category: createForm.category,
    created_at: new Date().toISOString()
  }

  // En mode mock, on ajoute directement (en production, appel API)
  mockPermissions.push(newPermission)

  // Reset form
  createForm.code = ''
  createForm.name_fr = ''
  createForm.category = ''
  createForm.description = ''

  showCreateModal.value = false
}

const updatePermission = () => {
  if (!editingPermission.value) return

  // Trouver et mettre à jour la permission
  const index = mockPermissions.findIndex(p => p.id === editingPermission.value!.id)
  if (index !== -1) {
    mockPermissions[index] = {
      ...mockPermissions[index],
      name_fr: editForm.name_fr,
      description: editForm.description || null
    }
  }

  showEditModal.value = false
  editingPermission.value = null
}

const deletePermission = () => {
  if (!deletingPermission.value || !deleteCheckResult.value?.canDelete) return

  // Supprimer la permission
  const index = mockPermissions.findIndex(p => p.id === deletingPermission.value!.id)
  if (index !== -1) {
    mockPermissions.splice(index, 1)
  }

  // Supprimer les relations avec les rôles
  const relationsToRemove = mockRolePermissions.filter(
    rp => rp.permission_id === deletingPermission.value!.id
  )
  relationsToRemove.forEach(relation => {
    const relIndex = mockRolePermissions.indexOf(relation)
    if (relIndex !== -1) {
      mockRolePermissions.splice(relIndex, 1)
    }
  })

  showDeleteModal.value = false
  deletingPermission.value = null
  deleteCheckResult.value = null
}

const togglePermission = (roleId: string, permissionId: string) => {
  const existingIndex = mockRolePermissions.findIndex(
    rp => rp.role_id === roleId && rp.permission_id === permissionId
  )

  if (existingIndex !== -1) {
    // Retirer la permission
    mockRolePermissions.splice(existingIndex, 1)
  } else {
    // Ajouter la permission
    mockRolePermissions.push({
      role_id: roleId,
      permission_id: permissionId
    })
  }
}
</script>
