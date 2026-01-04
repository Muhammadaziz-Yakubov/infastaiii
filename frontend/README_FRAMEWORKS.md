# Frameworklar va Librarylar

Bu loyihada quyidagi frameworklar va librarylar ishlatilgan:

## 📦 Asosiy Frameworklar

### 1. **React Hook Form + Zod**
- **Form validation** uchun
- **Type-safe** validation
- **Performance** optimizatsiya

**Ishlatish:**
```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

### 2. **TanStack Query (React Query)**
- **API state management**
- **Auto caching** va refetching
- **Loading/Error states**

**Ishlatish:**
```jsx
import { useQuery, useMutation } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['tasks'],
  queryFn: () => taskService.getTasks(),
});
```

### 3. **Framer Motion**
- **Animations** va transitions
- **Smooth UI** effects

**Ishlatish:**
```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### 4. **Zustand**
- **Global state management**
- **Lightweight** va oson

**Ishlatish:**
```jsx
import { useAppStore } from '@/stores/useAppStore';

const { theme, setTheme } = useAppStore();
```

### 5. **i18next (Internationalization)**
- **Multi-language** support
- **O'zbek, Rus, Ingliz** tillar

**Ishlatish:**
```jsx
import { useTranslation } from '@/hooks/useTranslation';

const { t, changeLanguage } = useTranslation();
<p>{t('common.save')}</p>
```

### 6. **Sentry**
- **Error tracking**
- **Production monitoring**

**Setup:**
`.env` faylga qo'shing:
```
VITE_SENTRY_DSN=your_sentry_dsn
```

### 7. **Vitest + React Testing Library**
- **Unit testing**
- **Component testing**

**Ishlatish:**
```bash
npm run test
npm run test:ui
```

### 8. **PWA Support**
- **Offline** ishlash
- **Install** qilish imkoniyati

### 9. **Prettier + Husky**
- **Code formatting**
- **Pre-commit hooks**

**Ishlatish:**
```bash
npm run format
```

## 📁 Fayl Strukturasi

```
frontend/
├── src/
│   ├── lib/
│   │   ├── queryClient.js      # TanStack Query config
│   │   ├── i18n.js              # i18next config
│   │   └── sentry.js            # Sentry config
│   ├── stores/
│   │   └── useAppStore.js       # Zustand store
│   ├── locales/
│   │   ├── uz.json              # O'zbek tili
│   │   ├── ru.json              # Rus tili
│   │   └── en.json              # Ingliz tili
│   ├── hooks/
│   │   └── useTranslation.js   # Translation hook
│   ├── components/
│   │   ├── AnimatedModal.jsx   # Framer Motion modal
│   │   └── AnimatedPage.jsx     # Page transitions
│   └── test/
│       └── setup.js             # Test setup
├── .prettierrc                  # Prettier config
├── .lintstagedrc.js             # Lint-staged config
├── vitest.config.js             # Vitest config
└── vite.config.js               # Vite config (PWA included)
```

## 🚀 Keyingi Qadamlar

1. **React Hook Form** ni form'larda ishlatish
2. **TanStack Query** ni API call'larda ishlatish
3. **Framer Motion** ni animatsiyalar uchun qo'llash
4. **Zustand** ni global state uchun ishlatish
5. **i18next** ni barcha text'larda ishlatish
6. **Sentry DSN** ni `.env` ga qo'shish
7. **Test** yozish

## 📝 Eslatmalar

- Barcha frameworklar **production-ready**
- **TypeScript** support mavjud
- **Tree-shaking** bilan optimizatsiya qilingan
- **Bundle size** optimizatsiya qilingan

