// useUsers - User management hook
import { useState, useMemo, useCallback, useEffect } from 'react'
import { 
  User, 
  UserFilters, 
  UserRole, 
  UserStatus, 
  mapUserResponseToUser, 
  mapUserToCreateRequest, 
  mapUserToUpdateRequest 
} from '@/foundation/types/user'
import { 
  getUsers, 
  createUser as apiCreateUser, 
  updateUser as apiUpdateUser, 
  deleteUser as apiDeleteUser,
  UserResponse 
} from '@/features/users/api/userApi'

export default function useUsers() {
  const [allUsersData, setAllUsersData] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backendTotalPages, setBackendTotalPages] = useState(1)
  const [backendTotalItems, setBackendTotalItems] = useState(0)
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all'
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortKey, setSortKey] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getUsers(0, 1000)
      
      if (response && response.data) {
        const pageData = response.data as any
        
        const totalElements = pageData.totalElements || pageData.total_elements || 0
        const totalPages = pageData.totalPages || pageData.total_pages || 0
        
        const contentArray = Array.isArray(pageData.content) ? pageData.content : []
        
        const mappedUsers = contentArray.map((userResponse: any) => {
          try {
            return mapUserResponseToUser(userResponse)
          } catch (mapError) {
            console.error('[useUsers] Error mapping user:', userResponse, mapError)
            return null
          }
        }).filter((user: any) => user !== null) as User[]
        
        setAllUsersData(mappedUsers)
        setBackendTotalPages(totalPages)
        setBackendTotalItems(totalElements || mappedUsers.length)
        
        if (mappedUsers.length === 0 && contentArray.length > 0) {
          setError('Có lỗi khi xử lý dữ liệu người dùng. Vui lòng kiểm tra console để biết thêm chi tiết.')
        }
      } else {
        setError('Không thể tải dữ liệu người dùng: Response không hợp lệ')
      }
    } catch (err: any) {
      console.error('[useUsers] Error fetching users:', err)
      console.error('[useUsers] Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        stack: err.stack
      })
      
      const token = localStorage.getItem('accessToken')
      
      if (err.response?.status === 401 || err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      } else {
        setError(err.message || 'Lỗi khi tải dữ liệu người dùng')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Filter users by filters
  const filteredUsers = useMemo(() => {
    let result = [...allUsersData]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone?.toLowerCase().includes(searchLower) ||
        user.phoneNumber?.toLowerCase().includes(searchLower) ||
        user.username?.toLowerCase().includes(searchLower)
      )
    }

    if (filters.role !== 'all') {
      result = result.filter(user => user.role === filters.role)
    }

    if (filters.status !== 'all') {
      result = result.filter(user => user.status === filters.status)
    }

    return result
  }, [allUsersData, filters])

  // Sort users
  const sortedUsers = useMemo(() => {
    const result = [...filteredUsers]

    result.sort((a, b) => {
      let aValue = a[sortKey as keyof User]
      let bValue = b[sortKey as keyof User]

      if (aValue === undefined) aValue = ''
      if (bValue === undefined) bValue = ''

      const aString = String(aValue).toLowerCase()
      const bString = String(bValue).toLowerCase()

      if (aString < bString) return sortOrder === 'asc' ? -1 : 1
      if (aString > bString) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [filteredUsers, sortKey, sortOrder])

  // Pagination
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return sortedUsers.slice(startIndex, endIndex)
  }, [sortedUsers, currentPage, itemsPerPage])

  const totalPages = useMemo(() => {
    return Math.ceil(sortedUsers.length / itemsPerPage)
  }, [sortedUsers.length, itemsPerPage])

  const totalItems = useMemo(() => {
    return sortedUsers.length
  }, [sortedUsers.length])

  // Update filter
  const updateFilter = useCallback((key: keyof UserFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }, [])

  // Sort handler
  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }, [sortKey])

  // Delete user
  const deleteUser = useCallback(async (userId: string) => {
    try {
      setLoading(true)
      setError(null)
      await apiDeleteUser(userId)
      await fetchUsers()
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xóa người dùng')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchUsers])

  // Toggle user status
  const toggleUserStatus = useCallback(async (userId: string) => {
    try {
      setLoading(true)
      setError(null)
      const user = allUsersData.find(u => u.id === userId)
      if (!user) {
        throw new Error('Không tìm thấy người dùng')
      }

      const newStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active'
      const updateRequest = mapUserToUpdateRequest({
        ...user,
        status: newStatus
      })

      await apiUpdateUser(userId, updateRequest)
      await fetchUsers()
    } catch (err: any) {
      setError(err.message || 'Lỗi khi thay đổi trạng thái người dùng')
      throw err
    } finally {
      setLoading(false)
    }
  }, [allUsersData, fetchUsers])

  // Update user
  const updateUser = useCallback(async (updatedUser: User) => {
    try {
      setLoading(true)
      setError(null)
      const updateRequest = mapUserToUpdateRequest(updatedUser)
      const response = await apiUpdateUser(updatedUser.id, updateRequest)
      
      if (response.data) {
        const mappedUser = mapUserResponseToUser(response.data)
        const updatedUserId = String(response.data.id)
        setAllUsersData(prev => {
          const index = prev.findIndex(u => u.id === updatedUserId)
          if (index !== -1) {
            const newData = [...prev]
            newData[index] = mappedUser
            return newData
          } else {
            return [mappedUser, ...prev]
          }
        })
      } else {
        await fetchUsers()
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật người dùng')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchUsers])

  // Add new user
  const addUser = useCallback(async (newUser: Omit<User, 'id' | 'createdAt'>) => {
    try {
      setLoading(true)
      setError(null)
      const createRequest = mapUserToCreateRequest(newUser)
      await apiCreateUser(createRequest)
      await fetchUsers()
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo người dùng')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchUsers])

  return {
    users: paginatedUsers,
    allUsers: sortedUsers,
    filters,
    updateFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    sortKey,
    sortOrder,
    handleSort,
    deleteUser,
    toggleUserStatus,
    updateUser,
    addUser,
    loading,
    error,
    refreshUsers: fetchUsers
  }
}
