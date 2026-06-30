import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx'
import { RoleRoute } from './components/auth/RoleRoute.jsx'
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute.jsx'
import { AppShell } from './components/layout/AppShell.jsx'

import { LoginPage } from './pages/auth/LoginPage.jsx'
import { RegisterPage } from './pages/auth/RegisterPage.jsx'
import { CollectorRegisterPage } from './pages/auth/CollectorRegisterPage.jsx'

import { UserDashboard } from './pages/user/UserDashboard.jsx'
import { UserProfile } from './pages/user/UserProfile.jsx'
import { CreateRequest } from './pages/user/CreateRequest.jsx'
import { MyRequests } from './pages/user/MyRequests.jsx'
import { RequestDetailsUser } from './pages/user/RequestDetailsUser.jsx'
import { Rewards } from './pages/user/Rewards.jsx'

import { CollectorDashboard } from './pages/collector/CollectorDashboard.jsx'
import { CollectorProfile } from './pages/collector/CollectorProfile.jsx'
import { AssignedRequests } from './pages/collector/AssignedRequests.jsx'
import { CollectorRequestDetails } from './pages/collector/CollectorRequestDetails.jsx'

import { AdminDashboard } from './pages/admin/AdminDashboard.jsx'
import { AdminProfile } from './pages/admin/AdminProfile.jsx'
import { PendingCollectors } from './pages/admin/PendingCollectors.jsx'
import { AllCollectors } from './pages/admin/AllCollectors.jsx'
import { AllRequests } from './pages/admin/AllRequests.jsx'
import { Landing } from './pages/Landing.jsx'

export default function App() {
  return (
    <Routes>
      {/* Public landing page is always accessible */}
      <Route path="/" element={<Landing />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/collector/register" element={<CollectorRegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          

          <Route element={<RoleRoute allow={['user']} />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/requests/new" element={<CreateRequest />} />
            <Route path="/requests" element={<MyRequests />} />
            <Route path="/requests/:id" element={<RequestDetailsUser />} />
            <Route path="/rewards" element={<Rewards />} />
          </Route>

          <Route element={<RoleRoute allow={['collector']} />}>
            <Route path="/collector" element={<CollectorDashboard />} />
            <Route path="/collector/profile" element={<CollectorProfile />} />
            <Route path="/collector/requests" element={<AssignedRequests />} />
            <Route
              path="/collector/requests/:id"
              element={<CollectorRequestDetails />}
            />
          </Route>

          <Route element={<RoleRoute allow={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/collectors/pending" element={<PendingCollectors />} />
            <Route path="/admin/collectors" element={<AllCollectors />} />
            <Route path="/admin/requests" element={<AllRequests />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
