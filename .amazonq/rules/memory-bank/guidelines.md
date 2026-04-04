# Suame - Development Guidelines

## Code Quality Standards

### TypeScript & Type Safety
- **Strict typing**: All files use TypeScript with strict mode enabled
- **Type imports**: Use `import type` for type-only imports to reduce bundle size
- **Async/await**: Preferred over `.then()` chains for readability
- **Error handling**: Try-catch blocks with typed error responses
- **Return types**: Always specify explicit return types for functions

### File Organization
- **Naming conventions**: 
  - Components: PascalCase (e.g., `DashboardAnalytics.tsx`)
  - Utilities/hooks: camelCase (e.g., `useIsMobile.ts`)
  - Server actions: kebab-case with `.actions.ts` suffix (e.g., `field-service.actions.ts`)
  - Models: kebab-case with `.models.ts` suffix (e.g., `user.models.ts`)
- **Single responsibility**: Each file has one primary purpose
- **Exports**: Named exports preferred over default exports for better tree-shaking

### Code Formatting
- **Indentation**: 2 spaces (configured in ESLint)
- **Line length**: Keep lines readable, break long lines
- **Semicolons**: Required at end of statements
- **Quotes**: Double quotes for strings
- **Trailing commas**: Used in multi-line objects/arrays

## Semantic Patterns

### Server Actions Pattern
All data mutations follow this structure:
```typescript
'use server'

export async function actionName(params: ParamType) {
  try {
    // 1. Validate input
    if (!params.required) {
      return { success: false, error: 'Validation failed' }
    }
    
    // 2. Check permissions
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // 3. Database operation
    const result = await Model.create(params)
    
    // 4. Return success response
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

### Component Patterns
- **Async components**: Used for server-side data fetching
- **Client components**: Marked with `'use client'` when needed
- **Props destructuring**: Always destructure props in function signature
- **Conditional rendering**: Use ternary operators for simple conditions, early returns for complex logic

### Permission Checking
- **Server-side**: Use `requirePermission()` in async components
- **Client-side**: Use `usePermissions()` hook for UI state
- **Pattern**: Check permissions before rendering sensitive content

```typescript
// Server-side
await requirePermission('dashboard')

// Client-side
const { hasPermission } = usePermissions()
if (!hasPermission('fieldService')) return null
```

### Data Fetching
- **Server actions**: For mutations and sensitive operations
- **API routes**: For public endpoints and webhooks
- **Direct queries**: Avoid in client components, use server actions instead

### Form Handling
- **React Hook Form**: Used with Zod validation
- **Pattern**: Form component wraps input components, handles submission via server action
- **Error display**: Errors shown inline with field-level validation

```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: initialValues,
})

const onSubmit = async (data: FormData) => {
  const result = await serverAction(data)
  if (!result.success) {
    form.setError('root', { message: result.error })
  }
}
```

### State Management
- **React Context**: For role-based access control
- **URL params**: For filter/sort state in lists
- **Local state**: For UI-only state (modals, dropdowns)
- **Server state**: Fetched fresh on each navigation

### Internationalization
- **Message files**: Stored in `/messages/[locale].json`
- **Usage**: `useTranslations()` hook in client components
- **Locale routing**: Handled by `next-intl` middleware
- **Pattern**: All user-facing text in message files, no hardcoded strings

## Architectural Patterns

### Role-Based Access Control (RBAC)
- **Roles**: admin, coordinator, attendant, group assistant, publisher
- **Permissions**: Granular permission system stored in Role model
- **Enforcement**: 
  - Server-side: `requirePermission()` in async components
  - Client-side: `usePermissions()` hook for UI
  - API: Permission checks in route handlers

### Database Operations
- **Mongoose models**: Define schema with validation
- **Indexes**: Vector indexes for semantic search on embedding fields
- **Timestamps**: Auto-added via schema options
- **Soft deletes**: Use `isDeleted` flag instead of hard deletes

### Error Handling
- **Consistent format**: `{ success: boolean, error?: string, data?: T }`
- **User messages**: Descriptive, non-technical error messages
- **Logging**: Use activity logger for audit trails
- **Validation**: Zod schemas for input validation

### Performance Optimization
- **Code splitting**: Dynamic imports for large components
- **Image optimization**: Use Next.js Image component
- **Caching**: Leverage Next.js caching strategies
- **IndexedDB**: Client-side caching for offline support
- **Vector search**: Efficient semantic search with embeddings

## Common Implementation Patterns

### Data Table with Actions
```typescript
// Pattern: Table component with row actions
<DataTable
  columns={columns}
  data={data}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### Modal Dialogs
- **Controlled**: State managed by parent component
- **Async operations**: Show loading state during submission
- **Validation**: Form validation before submission
- **Callbacks**: Parent handles success/error responses

### Selection Components
- **Dropdown**: Single selection with search
- **MultiSelect**: Multiple selection with tags
- **Pattern**: Controlled component with onChange callback

### Analytics Components
- **Recharts**: For data visualization
- **Responsive**: Mobile-friendly charts
- **Real-time**: Update on data changes

### Notification System
- **Sonner**: Toast notifications for user feedback
- **Types**: success, error, info, warning
- **Pattern**: Show after async operation completes

## Frequently Used Code Idioms

### Async Component with Permission Check
```typescript
const page = async () => {
  await requirePermission('featureName')
  const user = await currentUser()
  // Component logic
}
```

### Server Action with Validation
```typescript
export async function action(data: unknown) {
  const validated = schema.parse(data)
  // Process validated data
}
```

### Custom Hook for Data Fetching
```typescript
export function useData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchData().then(setData).finally(() => setLoading(false))
  }, [])
  
  return { data, loading }
}
```

### Conditional Rendering with Permissions
```typescript
{hasPermission('feature') && (
  <FeatureComponent />
)}
```

### Form Submission with Server Action
```typescript
const handleSubmit = async (formData: FormData) => {
  const result = await serverAction(formData)
  if (result.success) {
    toast.success('Success')
  } else {
    toast.error(result.error)
  }
}
```

## Popular Annotations & Decorators

### TypeScript Annotations
- **Type annotations**: `const value: string = "text"`
- **Function return types**: `function getName(): string { }`
- **Generic types**: `Array<T>`, `Record<K, V>`
- **Union types**: `type Status = 'active' | 'inactive'`
- **Optional properties**: `field?: value`

### JSDoc Comments
- Used for complex functions and public APIs
- Format: `/** Description */`
- Include param and return types

### Decorators (Mongoose)
- Schema options: `{ timestamps: true, collection: 'name' }`
- Field options: `{ required: true, unique: true, index: true }`

## Best Practices Summary

1. **Always validate input** - Use Zod schemas for all user input
2. **Check permissions** - Verify access before showing/processing data
3. **Handle errors gracefully** - Return consistent error responses
4. **Use TypeScript** - Leverage type safety throughout
5. **Keep components small** - Single responsibility principle
6. **Optimize performance** - Use React.memo, useMemo for expensive operations
7. **Test edge cases** - Consider null, undefined, empty states
8. **Document complex logic** - Use JSDoc for non-obvious code
9. **Follow naming conventions** - Consistent naming across codebase
10. **Reuse components** - Build component library in `/components/ui/`
