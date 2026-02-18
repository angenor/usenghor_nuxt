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

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>

    <template v-else>
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
            @click="activeTab = 'matrix'; loadMatrix()"
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
                  @input="debouncedSearch"
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
                @change="loadPermissions"
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
            v-for="category in permissionsByCategory"
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
                    <p v-if="permission.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {{ permission.description }}
                    </p>
                  </div>
                  <div class="flex items-center gap-4 ml-4">
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                      {{ permission.roles_count }} rôle{{ permission.roles_count > 1 ? 's' : '' }}
                    </span>
                    <div class="flex gap-2">
                      <button
                        @click="openEditModal(permission)"
                        class="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Modifier"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
            v-if="permissionsByCategory.length === 0"
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
        <!-- Loading matrix -->
        <div v-if="isLoadingMatrix" class="flex items-center justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>

        <template v-else>
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
                  <template v-for="category in matrixCategories" :key="category.code">
                    <!-- Ligne de catégorie -->
                    <tr class="bg-gray-100 dark:bg-gray-700">
                      <td
                        :colspan="matrix.roles.length + 1"
                        class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                      >
                        {{ permissionCategoryLabels[category.code] || category.code }}
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
                              @click="toggleMatrixPermission(role.id, permission.id)"
                              :disabled="isSavingMatrix"
                              :class="[
                                'w-6 h-6 rounded border-2 flex items-center justify-center transition-colors',
                                hasPermission(role.id, permission.id)
                                  ? 'bg-primary-600 border-primary-600 text-white'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-500',
                                isSavingMatrix ? 'opacity-50 cursor-not-allowed' : ''
                              ]"
                            >
                              <svg
                                v-if="hasPermission(role.id, permission.id)"
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
        </template>
      </div>
    </template>

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
            <form @submit.prevent="handleCreatePermission" class="p-6 space-y-4">
              <!-- Catégorie + Action côte à côte -->
              <div class="grid grid-cols-2 gap-4">
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
                    <option value="">Sélectionner...</option>
                    <option v-for="cat in categories" :key="cat" :value="cat">
                      {{ permissionCategoryLabels[cat] || cat }}
                    </option>
                  </select>
                </div>

                <!-- Action -->
                <div>
                  <label for="create-action" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Action <span class="text-red-500">*</span>
                  </label>
                  <select
                    id="create-action"
                    v-model="createForm.action"
                    required
                    class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner...</option>
                    <option v-for="action in actionOptions" :key="action.code" :value="action.code">
                      {{ action.label }}
                    </option>
                    <option value="_custom">Autre (personnalisé)</option>
                  </select>
                </div>
              </div>

              <!-- Action personnalisée (si "Autre" est sélectionné) -->
              <div v-if="createForm.action === '_custom'">
                <label for="create-custom-action" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Action personnalisée <span class="text-red-500">*</span>
                </label>
                <input
                  id="create-custom-action"
                  v-model="createForm.customAction"
                  type="text"
                  required
                  placeholder="ex: approve, archive, duplicate..."
                  class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Lettres minuscules et underscores uniquement
                </p>
              </div>

              <!-- Aperçu du code généré -->
              <div v-if="generatedCode" class="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-3">
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Code généré</p>
                <code class="text-sm font-mono text-brand-blue-600 dark:text-brand-blue-400">{{ generatedCode }}</code>
                <p v-if="createFormErrors.code" class="mt-1.5 text-xs text-red-500">
                  {{ createFormErrors.code }}
                </p>
              </div>

              <!-- Nom français -->
              <div>
                <label for="create-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom affiché
                </label>
                <input
                  id="create-name"
                  v-model="createForm.name_fr"
                  type="text"
                  :placeholder="suggestedName || 'Nom de la permission'"
                  class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Laissez vide pour utiliser le nom suggéré
                </p>
              </div>

              <!-- Description -->
              <div>
                <label for="create-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="create-description"
                  v-model="createForm.description"
                  rows="2"
                  placeholder="Description optionnelle..."
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
                  :disabled="isSaving || !generatedCode"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                >
                  <span v-if="isSaving">Création...</span>
                  <span v-else>Créer</span>
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
            <form @submit.prevent="handleUpdatePermission" class="p-6 space-y-4">
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
                <div v-if="isLoadingRoles" class="text-sm text-gray-500">Chargement...</div>
                <div v-else class="flex flex-wrap gap-2">
                  <span
                    v-for="role in editingPermissionRoles"
                    :key="role.id"
                    class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full"
                  >
                    {{ role.name_fr }}
                  </span>
                  <span
                    v-if="editingPermissionRoles.length === 0"
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
                  :disabled="isSaving"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                >
                  <span v-if="isSaving">Enregistrement...</span>
                  <span v-else>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import {
  useAdminPermissionsApi,
  permissionCategoryLabels,
  type Permission,
  type PermissionStats,
  type PermissionCategoryGroup,
} from '~/composables/useAdminPermissionsApi'
import { useAdminRolesApi, type Role } from '~/composables/useAdminRolesApi'

// Meta
definePageMeta({
  layout: 'admin'
})

// Composables
const {
  listPermissions,
  getAllPermissions,
  createPermission,
  updatePermission,
  getPermissionRoles,
  getPermissionMatrix,
  updatePermissionMatrix,
  getCategories,
  groupByCategory,
  calculateStats,
  validatePermissionCode,
  isCodeTaken,
} = useAdminPermissionsApi()

const { getAllRoles } = useAdminRolesApi()

// État
const isLoading = ref(true)
const isSaving = ref(false)
const isLoadingMatrix = ref(false)
const isSavingMatrix = ref(false)
const isLoadingRoles = ref(false)
const activeTab = ref<'list' | 'matrix'>('list')
const showCreateModal = ref(false)
const showEditModal = ref(false)

// Données
const permissions = ref<Permission[]>([])
const roles = ref<Role[]>([])
const stats = ref<PermissionStats>({ total: 0, categories_count: 0, active_roles: 0, roles_count: 0 })
const categories = ref<string[]>([])
const editingPermission = ref<Permission | null>(null)
const editingPermissionRoles = ref<Role[]>([])

// Matrix
const matrix = ref<{ roles: Array<{ id: string; code: string; name_fr: string }>; permissions: Record<string, unknown> }>({
  roles: [],
  permissions: {},
})
const rolePermissionsMap = ref<Map<string, string[]>>(new Map())

// Filtres
const filters = reactive({
  search: '',
  category: ''
})

// Actions prédéfinies pour le sélecteur
const actionOptions = [
  { code: 'view', label: 'Voir' },
  { code: 'create', label: 'Créer' },
  { code: 'edit', label: 'Modifier' },
  { code: 'delete', label: 'Supprimer' },
  { code: 'export', label: 'Exporter' },
  { code: 'evaluate', label: 'Évaluer' },
  { code: 'send', label: 'Envoyer' },
  { code: 'manage', label: 'Gérer' },
]

// Formulaires
const createForm = reactive({
  category: '',
  action: '',
  customAction: '',
  name_fr: '',
  description: '',
})

// Code auto-généré à partir de catégorie + action
const generatedCode = computed(() => {
  const action = createForm.action === '_custom' ? createForm.customAction.toLowerCase().trim() : createForm.action
  if (!createForm.category || !action) return ''
  return `${createForm.category}.${action}`
})

// Nom français auto-suggéré
const suggestedName = computed(() => {
  const actionLabel = createForm.action === '_custom'
    ? createForm.customAction.trim()
    : actionOptions.find(a => a.code === createForm.action)?.label || ''
  const categoryLabel = permissionCategoryLabels[createForm.category] || createForm.category
  if (!actionLabel || !categoryLabel) return ''
  return `${actionLabel} les ${categoryLabel.toLowerCase()}`
})

const createFormErrors = reactive({
  code: ''
})

const editForm = reactive({
  name_fr: '',
  description: ''
})

// Computed
const permissionsByCategory = computed<PermissionCategoryGroup[]>(() => {
  let filtered = permissions.value

  // Filtrer par recherche
  if (filters.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(p =>
      p.code.toLowerCase().includes(search) ||
      p.name_fr.toLowerCase().includes(search)
    )
  }

  // Filtrer par catégorie
  if (filters.category) {
    filtered = filtered.filter(p => p.category === filters.category)
  }

  return groupByCategory(filtered, rolePermissionsMap.value)
})

const matrixCategories = computed(() => {
  const grouped = new Map<string, Permission[]>()

  permissions.value.forEach((p) => {
    const category = p.category || 'other'
    if (!grouped.has(category)) {
      grouped.set(category, [])
    }
    grouped.get(category)!.push(p)
  })

  return Array.from(grouped.entries()).map(([code, perms]) => ({
    code,
    permissions: perms,
  }))
})

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // La recherche est gérée par le computed
  }, 300)
}

// Fonctions
async function loadPermissions() {
  try {
    const [permsResponse, rolesData] = await Promise.all([
      listPermissions({
        search: filters.search || undefined,
        category: filters.category || undefined,
        limit: 200,
      }),
      getAllRoles(),
    ])

    permissions.value = permsResponse.items
    roles.value = rolesData
    categories.value = getCategories(permissions.value)
    stats.value = calculateStats(permissions.value, rolesData)

    // Construire la map des permissions par rôle
    await buildRolePermissionsMap()
  }
  catch (error) {
    console.error('Erreur lors du chargement des permissions:', error)
  }
}

async function buildRolePermissionsMap() {
  const map = new Map<string, string[]>()

  for (const role of roles.value) {
    try {
      const rolePerms = await getPermissionRoles(role.id).catch(() => [])
      // Note: getPermissionRoles retourne les rôles qui ont cette permission
      // On doit inverser la logique
    }
    catch {
      // Ignorer les erreurs
    }
  }

  // Pour l'instant, utiliser la matrice pour construire la map
  if (matrix.value.roles.length > 0) {
    for (const role of matrix.value.roles) {
      const permIds: string[] = []
      permissions.value.forEach((perm) => {
        if (hasPermission(role.id, perm.id)) {
          permIds.push(perm.id)
        }
      })
      map.set(role.id, permIds)
    }
  }

  rolePermissionsMap.value = map
}

async function loadMatrix() {
  if (matrix.value.roles.length > 0) return // Déjà chargé

  isLoadingMatrix.value = true
  try {
    const data = await getPermissionMatrix()
    matrix.value = data

    // Reconstruire la map après chargement de la matrice
    await buildRolePermissionsMap()
  }
  catch (error) {
    console.error('Erreur lors du chargement de la matrice:', error)
  }
  finally {
    isLoadingMatrix.value = false
  }
}

function hasPermission(roleId: string, permissionId: string): boolean {
  // Chercher dans la structure de la matrice
  const permsData = matrix.value.permissions as Record<string, { roles?: Record<string, boolean> }>

  for (const [, permData] of Object.entries(permsData)) {
    if (permData.roles && permData.roles[roleId]) {
      // Trouver la permission correspondante
      const perm = permissions.value.find(p => p.id === permissionId)
      if (perm && permsData[perm.code]?.roles?.[matrix.value.roles.find(r => r.id === roleId)?.code || '']) {
        return true
      }
    }
  }

  // Fallback: vérifier via le code du rôle
  const role = matrix.value.roles.find(r => r.id === roleId)
  const perm = permissions.value.find(p => p.id === permissionId)
  if (role && perm) {
    const permData = permsData[perm.code]
    return permData?.roles?.[role.code] === true
  }

  return false
}

async function toggleMatrixPermission(roleId: string, permissionId: string) {
  isSavingMatrix.value = true
  try {
    const currentlyHas = hasPermission(roleId, permissionId)

    await updatePermissionMatrix({
      updates: [{
        role_id: roleId,
        permission_id: permissionId,
        granted: !currentlyHas,
      }],
    })

    // Recharger la matrice
    const data = await getPermissionMatrix()
    matrix.value = data
  }
  catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  }
  finally {
    isSavingMatrix.value = false
  }
}

function openEditModal(permission: Permission | { id: string; code: string; name_fr: string; description: string | null; roles_count: number }) {
  const fullPermission = permissions.value.find(p => p.id === permission.id)
  if (!fullPermission) return

  editingPermission.value = fullPermission
  editForm.name_fr = fullPermission.name_fr
  editForm.description = fullPermission.description || ''
  editingPermissionRoles.value = []
  showEditModal.value = true

  // Charger les rôles qui utilisent cette permission
  loadPermissionRoles(fullPermission.id)
}

async function loadPermissionRoles(permissionId: string) {
  isLoadingRoles.value = true
  try {
    editingPermissionRoles.value = await getPermissionRoles(permissionId)
  }
  catch (error) {
    console.error('Erreur lors du chargement des rôles:', error)
    editingPermissionRoles.value = []
  }
  finally {
    isLoadingRoles.value = false
  }
}

function validateCreateForm(): boolean {
  createFormErrors.code = ''

  if (!generatedCode.value) {
    createFormErrors.code = 'Sélectionnez une catégorie et une action'
    return false
  }

  if (!validatePermissionCode(generatedCode.value)) {
    createFormErrors.code = 'Le code généré est invalide. Vérifiez l\'action personnalisée (lettres et underscores uniquement).'
    return false
  }

  if (isCodeTaken(generatedCode.value, permissions.value)) {
    createFormErrors.code = 'Cette permission existe déjà'
    return false
  }

  return true
}

async function handleCreatePermission() {
  if (!validateCreateForm()) return

  isSaving.value = true
  try {
    await createPermission({
      code: generatedCode.value,
      name_fr: createForm.name_fr || suggestedName.value,
      category: createForm.category,
      description: createForm.description || null,
    })

    // Reset form
    createForm.category = ''
    createForm.action = ''
    createForm.customAction = ''
    createForm.name_fr = ''
    createForm.description = ''

    showCreateModal.value = false
    await loadPermissions()
  }
  catch (error) {
    console.error('Erreur lors de la création:', error)
  }
  finally {
    isSaving.value = false
  }
}

async function handleUpdatePermission() {
  if (!editingPermission.value) return

  isSaving.value = true
  try {
    await updatePermission(editingPermission.value.id, {
      name_fr: editForm.name_fr,
      description: editForm.description || null,
    })

    showEditModal.value = false
    editingPermission.value = null
    await loadPermissions()
  }
  catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  }
  finally {
    isSaving.value = false
  }
}

// Initialisation
onMounted(async () => {
  isLoading.value = true
  try {
    await loadPermissions()
  }
  finally {
    isLoading.value = false
  }
})
</script>
