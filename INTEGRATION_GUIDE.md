# 🚀 Panduan Implementasi & Integrasi Fitur Baru

## 📋 Daftar Isi
1. [Setup Database](#setup-database)
2. [Integrasi ke Halaman Existing](#integrasi-ke-halaman-existing)
3. [Penggunaan Effects](#penggunaan-effects)
4. [Penggunaan Tag Users](#penggunaan-tag-users)
5. [Penggunaan Location](#penggunaan-location)
6. [Troubleshooting](#troubleshooting)

---

## ⚠️ Setup Database (WAJIB DILAKUKAN DULU!)

### Step 1: Buka Supabase Dashboard
1. Buka [Supabase Console](https://supabase.com/dashboard)
2. Pilih project WigsStar
3. Klik **SQL Editor** (di sidebar kiri)

### Step 2: Jalankan Migration SQL
1. Copy isi file `supabase/migrations/add_effects_and_tagged_users.sql`
2. Paste ke SQL Editor
3. Klik **Run** (atau Ctrl+Enter)
4. Tunggu sampai selesai

**Output yang diharapkan:**
```
Executed Successfully
-- Menambah 2 kolom ke tabel stories
-- Membuat tabel post_tagged_users
-- Membuat indexes dan RLS policies
```

### Verifikasi Migration Berhasil
```sql
-- Di SQL Editor, cek apakah kolom sudah ada
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'stories' 
AND column_name IN ('caption', 'location');

-- Output harus: caption, location (2 rows)
```

---

## 📱 Integrasi ke Halaman Existing

### Update Index/Home Page
Jika menggunakan `useAllPosts`, ganti dengan `useOptimizedPosts`:

**Sebelum:**
```tsx
import { useAllPosts } from '@/hooks/usePosts';

const { data: posts = [] } = useAllPosts();
```

**Sesudah:**
```tsx
import { useOptimizedPosts } from '@/hooks/useOptimizedPosts';

const { 
  data, 
  isLoading,
  hasNextPage, 
  fetchNextPage,
  isFetchingNextPage 
} = useOptimizedPosts();

// Get flattened posts array
const posts = data?.pages.flatMap(page => page.posts) ?? [];
```

### Implementasi Infinite Scroll
```tsx
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export const PostsList = () => {
  const { 
    data, 
    hasNextPage, 
    fetchNextPage,
    isFetchingNextPage 
  } = useOptimizedPosts();
  
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap(page => page.posts) ?? [];

  return (
    <>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
      <div ref={ref} className="py-8">
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </>
  );
};
```

### Update Stories Section (Sudah Done!)
File `StoriesSection.tsx` sudah di-update otomatis.

---

## 🎨 Penggunaan Effects

### Dalam CreatePostModal (Sudah Integrated!)
Effects sudah built-in di CreatePostModal:
- Klik gambar preview → muncul Effects Picker
- Pilih effect → instant preview
- Support 7 effects

### Menggunakan Effects Standalone
```tsx
import { EffectsPicker } from '@/components/posts/EffectsPicker';
import { applyEffect } from '@/lib/effects';

function MyComponent() {
  const [selectedEffect, setSelectedEffect] = useState<string>();
  
  const handleApplyEffect = (effectId: string, canvas: HTMLCanvasElement) => {
    applyEffect(effectId, canvas);
  };

  return (
    <EffectsPicker
      selectedEffect={selectedEffect}
      onSelectEffect={(effectId) => {
        setSelectedEffect(effectId);
        // Apply to your canvas
        const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
        handleApplyEffect(effectId, canvas);
      }}
    />
  );
}
```

### Available Effects
```typescript
{
  grayscale: 'Grayscale effect',
  sepia: 'Sepia tone',
  invert: 'Invert colors',
  brightness: 'Increase brightness',
  darkness: 'Increase darkness',
  saturate: 'Saturate colors',
  blur: 'Blur effect'
}
```

---

## 👥 Penggunaan Tag Users

### Dalam CreatePostModal (Sudah Integrated!)
Tag users sudah built-in:
- Button "Tag Users"
- Search by username atau display name
- Multiple selection support
- Badges dengan remove option

### Menggunakan Tag Users Standalone
```tsx
import { UsersTagPicker } from '@/components/posts/UsersTagPicker';

function MyComponent() {
  const [selectedUsers, setSelectedUsers] = useState<TaggedUser[]>([]);
  
  const handleAddUser = (user: TaggedUser) => {
    setSelectedUsers(prev => {
      if (prev.some(u => u.user_id === user.user_id)) return prev;
      return [...prev, user];
    });
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.user_id !== userId));
  };

  return (
    <UsersTagPicker
      onSelectUser={handleAddUser}
      selectedUsers={selectedUsers}
      onRemoveUser={handleRemoveUser}
    />
  );
}
```

### Menyimpan Tagged Users
Ketika membuat post:
```typescript
// Di handleSubmit
const taggedUsersInserts = selectedUsers.map((taggedUser) => ({
  post_id: post.id,
  tagged_user_id: taggedUser.user_id,
}));

const { error } = await supabase
  .from('post_tagged_users')
  .insert(taggedUsersInserts);
```

### Fetch Tagged Users
```typescript
// Fetch users yang ditag di post tertentu
const { data: taggedUsers } = await supabase
  .from('post_tagged_users')
  .select(`
    tagged_user_id,
    profiles (
      user_id,
      username,
      display_name,
      avatar_url
    )
  `)
  .eq('post_id', postId);
```

---

## 📍 Penggunaan Location

### Dalam CreatePostModal & CreateStoryModal (Sudah Integrated!)
Location sudah built-in:
- Enable/Disable toggle
- Popular locations list (Indonesia)
- Custom location support
- Hanya save jika enabled

### Menggunakan Location Picker Standalone
```tsx
import { LocationPicker } from '@/components/posts/LocationPicker';

function MyComponent() {
  const [location, setLocation] = useState('');
  const [locationEnabled, setLocationEnabled] = useState(true);
  
  return (
    <LocationPicker
      value={location}
      onChange={setLocation}
      onEnableChange={setLocationEnabled}
      enabled={locationEnabled}
    />
  );
}
```

### Menambah Popular Locations
Edit file `src/components/posts/LocationPicker.tsx`:
```typescript
const POPULAR_LOCATIONS = [
  'Jakarta',
  'Surabaya',
  'Bandung',
  // Tambah lokasi baru di sini
  'Kota Baru',
];
```

### Fetch Posts dengan Location
```typescript
// Fetch posts dengan specific location
const { data: locationPosts } = await supabase
  .from('posts')
  .select('*')
  .eq('location', 'Jakarta')
  .order('created_at', { ascending: false });
```

---

## 🧪 Testing Checklist

- [ ] Database migration berhasil
- [ ] Create post dengan effects
- [ ] Create post dengan tag users
- [ ] Create post dengan location
- [ ] Create story dengan caption
- [ ] Create story dengan location
- [ ] Story effects berfungsi (hanya image)
- [ ] Infinite scroll posts bekerja
- [ ] Storage tidak penuh (check file size)

---

## 🐛 Troubleshooting

### Error: "caption does not exist on stories"
**Penyebab:** Migration belum dijalankan  
**Solusi:** Jalankan migration SQL di Supabase (lihat Setup Database)

### Effects tidak terlihat di preview
**Penyebab:** Image tidak fully loaded  
**Solusi:** Tunggu sebentar sebelum apply effect, atau reload

### Tag users tidak muncul di post
**Penyebab:** 
- Table `post_tagged_users` belum ada
- User belum ter-fetch

**Solusi:** 
- Jalankan migration
- Pastikan `useAllProfiles` berhasil fetch

### Location tidak disimpan
**Penyebab:** Location toggle tidak di-enable  
**Solusi:** Pastikan toggle ON sebelum membuat post

### Performa posts masih lambat
**Penyebab:** Masih menggunakan `useAllPosts`  
**Solusi:** 
- Ganti ke `useOptimizedPosts`
- Implementasi infinite scroll
- Check React DevTools Profiler

### Story caption tidak tampil
**Penyebab:** 
- Kolom belum ada di database (migration belum jalan)
- Komponen belum di-update

**Solusi:**
- Jalankan migration terlebih dahulu
- Caption akan berfungsi setelah kolom ada

---

## 📚 File Reference

### Components
- `src/components/posts/CreatePostModal.tsx` - Create post (updated)
- `src/components/posts/CreateStoryModal.tsx` - Create story (updated)
- `src/components/posts/EffectsPicker.tsx` - Effects UI
- `src/components/posts/UsersTagPicker.tsx` - Tag users UI
- `src/components/posts/LocationPicker.tsx` - Location UI
- `src/components/posts/StoriesSection.tsx` - Stories (updated)

### Hooks
- `src/hooks/useOptimizedPosts.ts` - Optimized posts + infinite scroll
- `src/hooks/useOptimizedStories.ts` - Optimized stories + cache
- `src/hooks/useAllProfiles.ts` - Optimized + cached profiles

### Library
- `src/lib/effects.ts` - Effects implementation

### Database
- `supabase/migrations/add_effects_and_tagged_users.sql` - Migration

### Documentation
- `OPTIMIZATION_DOCUMENTATION.md` - Full technical docs
- `IMPLEMENTATION_SUMMARY.md` - Change summary

---

## 🎯 Next Steps (Optional)

1. **Add more effects** - Edit `src/lib/effects.ts`
2. **Add more locations** - Edit LocationPicker.tsx
3. **Add filters** - Similar pattern sebagai effects
4. **Add stickers/overlays** - Extend effects system
5. **Add video effects** - Currently only image support

---

## 💬 Support

Untuk pertanyaan:
1. Check `OPTIMIZATION_DOCUMENTATION.md` untuk technical details
2. Check `IMPLEMENTATION_SUMMARY.md` untuk overview
3. Check troubleshooting section di atas

---

**Status:** ✅ Ready to use (setelah database migration)
