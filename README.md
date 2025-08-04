# StorySail Pro

A modern mobile application built with Expo and React Native that allows users to explore and discover captivating stories from various genres. With an intuitive user interface, users can easily navigate through the app and immerse themselves in a world of storytelling.

## 🚀 Features

- **Authentication**: Secure email and Google Sign-In
- **Rich Text Editor**: Create and edit stories with rich formatting
- **Notifications**: Push notifications and in-app notifications
- **Swipeable Tabs**: Smooth navigation between sections
- **Sortable Lists**: Interactive drag-and-drop functionality
- **Persistence Storage**: Local data persistence with MMKV
- **Scratch Card**: Interactive reward system
- **Custom Components**: DropDown, Switches, Carousel, Pagination
- **Deep Linking**: Seamless app navigation
- **State Management**: Zustand for efficient state management

## 📱 Screen Recording

<img src="https://github.com/mshivam019/StorySail/blob/master/file.gif" alt="StorySail App Demo">

## 🛠️ Tech Stack

- **Framework**: Expo (React Native)
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Backend**: Supabase
- **Authentication**: Supabase Auth + Google Sign-In
- **Animations**: React Native Reanimated
- **Storage**: MMKV
- **Notifications**: Expo Notifications + FCM
- **UI Components**: Custom components with React Native

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd StorySail-Pro
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` or `.env.local` file in the root directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
```

### 4. Supabase Setup

Follow the Supabase setup guide from [here](https://github.com/supabase/supabase/tree/master/examples/user-management/expo-push-notifications#readme)

### 5. Firebase Setup

1. Create a Firebase project
2. Replace the `google-services.json` file with your own
3. Use the WebClient ID from your Firebase project in your Supabase project and environment variables

### 6. Run the Application

```bash
# Start the development server
npm start
# or
yarn start

# Run on Android
npm run android
# or
yarn android

# Run on iOS
npm run ios
# or
yarn ios

# Run on web
npm run web
# or
yarn web
```

## 📁 Project Structure

```
StorySail-Pro/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point
├── components/            # Reusable components
│   ├── Create/           # Story creation components
│   ├── Explore/          # Search and exploration
│   ├── Favourites/       # Favorites management
│   ├── Home/             # Home screen components
│   └── Onboarding/       # Onboarding components
├── store/                # Zustand stores
├── provider/             # Context providers
├── lib/                  # External library configurations
├── utils/                # Utility functions and hooks
├── assets/               # Static assets
└── supabase/             # Supabase configuration
```

## 🔧 Development

### Code Quality

The project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting

### Available Scripts

```bash
# Start development server
npm start

# Run linter
npm run lint

# Build for production
npm run build

# Run tests (when implemented)
npm test
```

## 📱 Platform Support

- ✅ iOS
- ✅ Android
- ✅ Web (basic support)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please:

1. Check the [Issues](https://github.com/mshivam019/StorySail/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

## 🙏 Acknowledgments

- Expo team for the amazing framework
- Supabase for the backend services
- React Native community for the excellent ecosystem
- All contributors who helped improve this project