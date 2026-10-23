/**
 * Kiểu dữ liệu DTO của backend (JSDoc để dùng với JS).
 * Nguồn: FRONTEND_API_SPEC.md §5, §6.
 * Ảnh bìa là URL (`coverImageUrl`, <=500) do /files/upload trả về, không phải field multipart.
 *
 * @typedef {'COMPLETED'|'ONGOING'|'ONHOLD'} MangaStatus
 * @typedef {'APPROVED'|'DELETED'} TransGroupStatus
 * @typedef {'LEADER'|'MEMBER'|'PENDING_REQUEST'|'NONE'} MyGroupStatus
 * @typedef {'PENDING'|'APPROVED'|'REJECTED'} GroupJoinRequestStatus
 * @typedef {'PENDING'|'APPROVED'|'REJECTD'} GroupCreationRequestStatus
 * @typedef {'ADMIN'|'USER'|'TRANSLATOR'} RoleName
 *
 * @typedef {Object} PaginatedResponse
 * @property {number} currentPage 1-based
 * @property {number} pageSize
 * @property {number} totalPages
 * @property {number} totalElements
 * @property {Array<*>} content
 *
 * @typedef {Object} PageQuery
 * @property {number} [page] 0-based
 * @property {number} [size]
 * @property {string} [sortBy] hướng luôn là DESC
 *
 * @typedef {Object} SocialAuthRequest
 * @property {string} credential Google ID token
 *
 * @typedef {Object} AuthenticationResponse
 * @property {boolean} authenticated
 * @property {string} token
 * @property {number} expiresIn giây
 *
 * @typedef {Object} IntrospectResponse
 * @property {boolean} valid
 *
 * @typedef {Object} CurrentUserResponse
 * @property {string} id
 * @property {string} username
 * @property {string|null} displayName
 * @property {string|null} email
 * @property {string|null} facebook
 * @property {string|null} discord
 * @property {string|null} bio
 * @property {string|null} avatar
 * @property {string} createdAt
 *
 * @typedef {Object} UserSummaryResponse
 * @property {string} id
 * @property {string} username
 * @property {string|null} displayName
 * @property {string|null} avatar
 *
 * @typedef {Object} PublicUserProfileResponse
 * @property {string} id
 * @property {string} username
 * @property {string|null} displayName
 * @property {string|null} avatar
 * @property {string|null} bio
 * @property {string|null} facebook
 * @property {string|null} discord
 * @property {string} createdAt
 * @property {TransGroupSummaryResponse|null} transGroup nhóm APPROVED (member hoặc leader)
 *
 * @typedef {Object} UserResponse
 * @property {string} id
 * @property {string} username
 * @property {string|null} displayName
 * @property {string|null} email
 * @property {string|null} facebook
 * @property {string|null} discord
 * @property {string|null} bio
 * @property {RoleResponse[]} roles
 * @property {string|null} transGroupId
 * @property {string} createdAt
 * @property {string} updatedAt
 *
 * @typedef {Object} UserCreationRequest
 * @property {string} username 3..50
 * @property {string} password 5..30
 * @property {string} [email]
 * @property {string[]} [roles]
 *
 * @typedef {Object} UserUpdateForm
 * @property {string} [displayName] <=50
 * @property {string} [facebook]
 * @property {string} [discord]
 * @property {string} [bio] <=300
 * @property {File} [avatar]
 *
 * @typedef {Object} UserPasswordRequest
 * @property {string} oldPassword
 * @property {string} newPassword
 *
 * @typedef {Object} CategoryRequest
 * @property {string} name 2..100
 * @property {string} [description] <=200
 *
 * @typedef {Object} CategoryResponse
 * @property {number} id
 * @property {string} name
 * @property {string|null} description
 *
 * @typedef {Object} MangaCreationRequest
 * @property {string} name <=200
 * @property {string} [authorsName] <=255
 * @property {string} [coverImageUrl] <=500
 * @property {string[]} [transGroups]
 * @property {number[]} categoryIds
 * @property {MangaStatus} status
 * @property {string} [description] <=500
 *
 * @typedef {Object} MangaUpdateRequest
 * @property {string} name
 * @property {string} [authorsName]
 * @property {string} [coverImageUrl] <=500; null/omitted giữ nguyên giá trị cũ
 * @property {string[]} [addTransGroups]
 * @property {number[]} categoryIds
 * @property {MangaStatus} status
 * @property {string} [description]
 *
 * @typedef {Object} MangaResponse
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} [coverImageUrl]
 * @property {MangaStatus} status
 * @property {string|null} description
 * @property {CategoryResponse[]} categories
 * @property {TransGroupSummaryResponse[]} transGroupsId (thực chất là object summary)
 * @property {string} updatedAt
 *
 * @typedef {Object} MangaSummaryResponse
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} [coverImageUrl]
 * @property {string|null} authorsName
 * @property {MangaStatus} status
 * @property {string|null} description
 * @property {string} createdAt
 *
 * @typedef {Object} MangaDetailsResponse
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} [coverImageUrl]
 * @property {string|null} authorsName
 * @property {MangaStatus} status
 * @property {CategoryResponse[]} categories
 * @property {TransGroupSummaryResponse[]} transGroups
 * @property {string|null} description
 * @property {string} createdAt
 *
 * @typedef {Object} MangaManagementResponse
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} [coverImageUrl]
 * @property {MangaStatus} status
 * @property {string|null} description
 * @property {CategoryResponse[]} categories
 * @property {TransGroupManagementResponse[]} transGroups
 * @property {string} updatedAt
 *
 * @typedef {Object} TransGroupManagementResponse
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {boolean} canRemove
 *
 * @typedef {Object} ChapterRequest
 * @property {number} chapterIndex
 * @property {string} [title] <=200
 * @property {string[]} pageUrls 1..150 URL do /files/upload trả về
 *
 * @typedef {Object} ChapterResponse
 * @property {string} id
 * @property {string|null} mangaName
 * @property {number} chapterIndex
 * @property {string|null} title
 * @property {number} views
 * @property {string[]} pageUrls
 * @property {string} updatedAt
 *
 * @typedef {Object} ChapterSummaryResponse
 * @property {string} id
 * @property {number} chapterIndex
 * @property {string|null} title
 * @property {number} views
 * @property {string} updatedAt
 *
 * @typedef {Object} PageResponse
 * @property {string} id
 * @property {number} pageNumber
 * @property {string} imageUrl
 * @property {string} createdAt
 * @property {string} updatedAt
 *
 * @typedef {Object} TransGroupSummaryResponse
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} [coverImageUrl]
 * @property {string} [avatar] backend hiện trả field này ở summary
 *
 * @typedef {Object} TransGroupUpdateRequest
 * @property {string} [name] 5..50
 * @property {string} [coverImageUrl] <=500
 * @property {string} [description] <=300
 *
 * @typedef {Object} TransGroupResponse
 * @property {string} id
 * @property {UserSummaryResponse} leader
 * @property {string} name
 * @property {string} slug
 * @property {TransGroupStatus} status
 * @property {UserSummaryResponse[]} members
 * @property {string|null} description
 * @property {string} createdAt
 *
 * @typedef {Object} TransGroupDetailsResponse
 * @property {string} id
 * @property {UserSummaryResponse} leader
 * @property {string} name
 * @property {string} slug
 * @property {TransGroupStatus} status
 * @property {MangaSummaryResponse[]} translatedMangas
 * @property {UserSummaryResponse[]} members
 * @property {string|null} description
 * @property {string} createdAt
 *
 * @typedef {Object} TransGroupOfUserResponse
 * @property {TransGroupSummaryResponse} [transGroup]
 * @property {MyGroupStatus} status
 *
 * @typedef {Object} CreationRequest
 * @property {string} groupName 5..50
 * @property {string} [coverImageUrl] <=500
 * @property {string} [description] <=300
 *
 * @typedef {Object} CreationRequestResponse
 * @property {string} id
 * @property {string} groupName
 * @property {string} [coverImageUrl]
 * @property {string|null} creatorName
 * @property {GroupCreationRequestStatus} status
 * @property {string|null} description
 * @property {string} updatedAt
 *
 * @typedef {Object} JoinRequestResponse
 * @property {string} id
 * @property {string|null} transGroupName
 * @property {string|null} username
 * @property {GroupJoinRequestStatus} status
 * @property {string} createdAt
 * @property {string} updatedAt
 *
 * @typedef {Object} RoleRequest
 * @property {string} name <=20
 * @property {string} [description] <=100
 * @property {string[]} permissions
 *
 * @typedef {Object} RoleResponse
 * @property {string} name
 * @property {string|null} description
 * @property {PermissionResponse[]} permissions
 *
 * @typedef {Object} PermissionRequest
 * @property {string} name <=50
 * @property {string} [description] <=100
 *
 * @typedef {Object} PermissionResponse
 * @property {string} name
 * @property {string|null} description
 */
export {};
