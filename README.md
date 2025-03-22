# Go Together 🚗🫂  

Go Together is a smart carpooling platform that connects drivers and passengers for convenient, cost-effective, and eco-friendly shared rides. With location tracking and secure authentication, Go Together makes ride-sharing seamless.  

## 🌟 Features  

✅ **User Authentication** – Secure login and registration with Firebase.  
✅ **Find & Offer Rides** – Drivers can post available rides, and passengers can book them.  
✅ **Interactive Maps** – Uses Leaflet.js and OpenStreetMap for real-time route mapping.  

## 🛠 Tech Stack  

- **Frontend:** React.js, Next.js, Tailwind CSS  
- **Backend:** Next.js API routes (serverless functions)  
- **Database & Auth:** Firebase  
- **Maps & Location:** Leaflet.js, OpenStreetMap API  
- **Hosting:** Vercel  

## 📦 Installation & Setup  

1. Clone the repository:  
   ```sh
   git clone https://github.com/yourusername/go-together.git
   cd go-together
   ```  

2. Install dependencies:  
   ```sh
   npm install
   ```  

3. Set up environment variables in a `.env.local` file:  
   ```sh
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   NEXT_PUBLIC_MAP_API_KEY=your_openstreetmap_api_key
   ```  

4. Run the development server:  
   ```sh
   npm run dev
   ```  

5. Open [http://localhost:3000](http://localhost:3000) to see the app in action.  

## 🚀 Contributing  

Feel free to fork the repo, create a branch, and submit a pull request. Suggestions and contributions are always welcome!  

## 📄 License  

This project is licensed under the MIT License.  

---

Let me know if you’d like any modifications!