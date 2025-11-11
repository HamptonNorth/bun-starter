// ============================================================================
// GLOBAL VARIABLES
// ============================================================================
let currentMode = 'add'
let usersCache = [] // Store loaded users for ID lookup

// DOM Elements
let formTitle = null
let formButton = null
let idFieldContainer = null
let userIdInput = null
let userNameInput = null
let firstNameInput = null
let surnameInput = null
let statusSettingInput = null
let responseMessage = null
let allUsersResponse = null

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', function () {
  initializeDOMElements()
  attachEventListeners()
  updateFormForMode('add')
})

function initializeDOMElements() {
  // Get all form elements
  formTitle = document.getElementById('formTitle')
  formButton = document.getElementById('formButton')
  idFieldContainer = document.getElementById('idFieldContainer')
  userIdInput = document.getElementById('user_id')
  userNameInput = document.getElementById('user_name')
  firstNameInput = document.getElementById('first_name')
  surnameInput = document.getElementById('surname')
  statusSettingInput = document.getElementById('status_setting')
  responseMessage = document.getElementById('responseMessage')
  allUsersResponse = document.getElementById('allUsersResponse')

  // Validate critical elements exist
  if (!formTitle || !formButton || !responseMessage) {
    console.error('Critical form elements not found')
  }
}

function attachEventListeners() {
  // Get Users button
  const getUsersButton = document.getElementById('getUsersBtn')
  if (getUsersButton) {
    getUsersButton.addEventListener('click', getAllUsers)
  }

  // Mode radio buttons
  const modeRadios = document.querySelectorAll('input[name="mode"]')
  modeRadios.forEach((radio) => {
    radio.addEventListener('change', function () {
      currentMode = this.value
      updateFormForMode(currentMode)
    })
  })

  // User ID input - auto-populate form when ID is entered
  userIdInput.addEventListener('input', handleUserIdInput)

  // Form submission
  const userForm = document.getElementById('userForm')
  if (userForm) {
    userForm.addEventListener('submit', handleFormSubmit)
  }
}

// ============================================================================
// MODE MANAGEMENT
// ============================================================================
function updateFormForMode(mode) {
  switch (mode) {
    case 'add':
      setupAddMode()
      break
    case 'amend':
      setupAmendMode()
      break
    case 'delete':
      setupDeleteMode()
      break
  }
}

function setupAddMode() {
  formTitle.textContent = 'Add New User'
  formButton.textContent = 'Add User'

  // Hide ID field
  idFieldContainer.classList.add('hidden')
  userIdInput.removeAttribute('required')

  // Enable all input fields
  userNameInput.disabled = false
  firstNameInput.disabled = false
  surnameInput.disabled = false
  statusSettingInput.disabled = false

  // Reset form
  document.getElementById('userForm').reset()
  hideResponseMessage()
}

function setupAmendMode() {
  formTitle.textContent = 'Amend User'
  formButton.textContent = 'Amend User'

  // Show ID field and make it required
  idFieldContainer.classList.remove('hidden')
  userIdInput.setAttribute('required', 'required')

  // Enable all input fields
  userNameInput.disabled = false
  firstNameInput.disabled = false
  surnameInput.disabled = false
  statusSettingInput.disabled = false

  // Clear form but keep ID if present
  const currentId = userIdInput.value
  document.getElementById('userForm').reset()
  // userIdInput.value = currentId
  // userIdInput.value = ''

  // Reset ID field styling
  userIdInput.classList.remove('border-green-500', 'border-red-300')
  userIdInput.classList.add('border-slate-300')

  hideResponseMessage()
}

function setupDeleteMode() {
  formTitle.textContent = 'Delete User'
  formButton.textContent = 'Delete User'

  // Show ID field and make it required
  idFieldContainer.classList.remove('hidden')
  userIdInput.setAttribute('required', 'required')

  // Disable other input fields (read-only for delete)
  userNameInput.disabled = true
  firstNameInput.disabled = true
  surnameInput.disabled = true
  statusSettingInput.disabled = true

  // Clear non-ID fields
  userNameInput.value = ''
  firstNameInput.value = ''
  surnameInput.value = ''

  // Reset ID field styling
  userIdInput.classList.remove('border-green-500', 'border-red-300')
  userIdInput.classList.add('border-slate-300')

  hideResponseMessage()
}

// ============================================================================
// USER ID AUTO-POPULATION
// ============================================================================
function handleUserIdInput() {
  const userId = userIdInput.value.trim()

  // Only try to populate if we have a valid ID and we're in amend/delete mode
  if (userId && (currentMode === 'amend' || currentMode === 'delete')) {
    populateFormFromUserId(userId)
  } else {
    // Clear form fields if ID is empty
    if (currentMode === 'amend') {
      clearFormFields()
    }
  }
}

function populateFormFromUserId(userId) {
  // Find user in cache
  const user = usersCache.find((u) => u.id == userId)

  if (user) {
    // Populate form fields
    userNameInput.value = user.user_name || ''
    firstNameInput.value = user.first_name || ''
    surnameInput.value = user.surname || ''
    statusSettingInput.value = user.status_setting || 'Active'

    // Show success indicator
    userIdInput.classList.remove('border-red-300', 'border-slate-300')
    userIdInput.classList.add('border-green-500')
    hideResponseMessage()
  } else {
    // User not found - check if we need to fetch users first
    if (usersCache.length === 0) {
      showInfoMessage('Please click "Get Test Users" first to load user data')
    } else {
      // User not found in cache
      userIdInput.classList.remove('border-green-500', 'border-slate-300')
      userIdInput.classList.add('border-red-300')

      if (currentMode === 'amend') {
        clearFormFields()
      }
    }
  }
}

function clearFormFields() {
  userNameInput.value = ''
  firstNameInput.value = ''
  surnameInput.value = ''
  statusSettingInput.value = 'Active'

  // Reset ID field border
  userIdInput.classList.remove('border-green-500', 'border-red-300')
  userIdInput.classList.add('border-slate-300')
}

// ============================================================================
// FORM SUBMISSION
// ============================================================================
function handleFormSubmit(event) {
  event.preventDefault()

  switch (currentMode) {
    case 'add':
      addUser()
      break
    case 'amend':
      amendUser()
      break
    case 'delete':
      deleteUser()
      break
  }
}

// ============================================================================
// API CALLS
// ============================================================================
async function addUser() {
  const formData = getFormData()

  try {
    const response = await fetch('/api/add-test-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (response.ok) {
      showSuccessMessage(`User added successfully (ID: ${data.id})`)
      document.getElementById('userForm').reset()
      refreshUsersTableIfVisible()
    } else {
      handleErrorResponse(data)
    }
  } catch (error) {
    showErrorMessage(error.message)
  }
}

async function amendUser() {
  const formData = getFormData()

  try {
    const response = await fetch('/api/update-test-user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (response.ok) {
      showSuccessMessage(`User amended successfully (id: ${data.id} ${data.user_name})`)
      document.getElementById('userForm').reset()
      refreshUsersTableIfVisible()
    } else {
      handleErrorResponse(data)
    }
  } catch (error) {
    showErrorMessage(error.message)
  }
}

async function deleteUser() {
  const userId = userIdInput.value

  if (!confirm(`Are you sure you want to delete user ID ${userId}?`)) {
    return
  }

  try {
    const response = await fetch('/api/delete-test-user', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    })

    const data = await response.json()

    if (response.ok) {
      showSuccessMessage(`User deleted successfully (ID: ${userId})`)
      document.getElementById('userForm').reset()
      refreshUsersTableIfVisible()
    } else {
      handleErrorResponse(data)
    }
  } catch (error) {
    showErrorMessage(error.message)
  }
}

async function getAllUsers() {
  try {
    // Show loading state
    allUsersResponse.innerHTML = '<p class="text-slate-500">Loading...</p>'

    // Fetch data
    const response = await fetch('/api/test-users')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const users = await response.json()

    // Store users in cache for ID lookup
    usersCache = users

    if (users.length === 0) {
      allUsersResponse.innerHTML = '<p class="text-slate-500">No users found.</p>'
    } else {
      displayUsersTable(users)
    }
  } catch (error) {
    allUsersResponse.innerHTML = `<p class="text-red-600">Error: ${error.message}</p>`
    console.error('Error fetching users:', error)
  }
}

// ============================================================================
// DISPLAY FUNCTIONS
// ============================================================================
function displayUsersTable(users) {
  allUsersResponse.innerHTML = `
    <table class="min-w-full divide-y divide-slate-200 mt-4 text-xs">
      <thead class="bg-slate-50">
        <tr>
          <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">ID</th>
          <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">Username</th>
          <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">First Name</th>
          <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">Surname</th>
          <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">Status</th>
          <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">Date Added</th>
          <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">Date Amended</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-slate-100">
        ${users
          .map(
            (user) => `
          <tr class="hover:bg-slate-50">
            <td class="px-4 py-1 text-xs text-slate-700 font-light">${user.id}</td>
            <td class="px-4 py-1 text-xs text-slate-700 font-light">${user.user_name}</td>
            <td class="px-4 py-1 text-xs text-slate-700 font-light">${user.first_name}</td>
            <td class="px-4 py-1 text-xs text-slate-700 font-light">${user.surname}</td>
            <td class="px-4 py-1 text-xs text-slate-700 font-light">${user.status_setting}</td>
            <td class="px-4 py-1 text-xs text-slate-700 font-light">${user.date_added}</td>
            <td class="px-4 py-1 text-xs text-slate-700 font-light">${user.date_last_amended}</td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>
  `
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function getFormData() {
  const form = document.getElementById('userForm')
  const formData = new FormData(form)
  return Object.fromEntries(formData.entries())
}

function refreshUsersTableIfVisible() {
  if (allUsersResponse && allUsersResponse.innerHTML.trim() !== '') {
    getAllUsers()
  }
}

function handleErrorResponse(data) {
  if (data.details && data.details.includes('UNIQUE constraint failed')) {
    showErrorMessage('Username already exists. Usernames must be unique.')
  } else {
    showErrorMessage(data.error || data.message || 'Operation failed')
  }
}

function showSuccessMessage(message) {
  responseMessage.className =
    'mt-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded-md'
  responseMessage.textContent = message
  responseMessage.classList.remove('hidden')

  // Auto-hide after 5 seconds
  setTimeout(() => {
    responseMessage.classList.add('hidden')
  }, 5000)
}

function showErrorMessage(message) {
  responseMessage.className =
    'flex-1 mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded-md'
  responseMessage.textContent = message
  responseMessage.classList.remove('hidden')
}

function showInfoMessage(message) {
  responseMessage.className = 'mt-4 p-2 bg-blue-100 border border-blue-400 text-blue-700 rounded-md'
  responseMessage.textContent = message
  responseMessage.classList.remove('hidden')
}

function hideResponseMessage() {
  responseMessage.classList.add('hidden')
}
