// Quick start guide for wiring enforcement across routes and pages

## Backend: Wire trial lock and storage cap middleware

### Example: Protect all tenant dashboard routes with trial lock

In `backend/src/routes/dashboardRoutes.js` or similar:

```javascript
import { trialLock } from '../middleware/trialLockMiddleware.js';
import { storageCapCheck } from '../middleware/storageCapMiddleware.js';

// Apply trial lock to all dashboard routes
router.use(trialLock);

// Apply storage cap check to study material routes
router.post('/materials/upload', storageCapCheck, uploadMaterial);
```

### Example: Student cap enforcement (already wired in studentController.js)

When creating a student:
1. `planGuard.checkStudentCap()` checks current count vs tier limit (50/100/unlimited)
2. If over cap, returns 402 with upgrade-required message
3. Frontend catches 402 and shows upsell modal

## Frontend: Wire upsell components

### Example: Show trial badge on dashboard

In `frontend/app/dashboard/page.tsx` or similar:

```typescript
import { TrialBadge, UpsellModal } from '@/components/PlanGating';

export default function Dashboard() {
  const [upsellOpen, setUpsellOpen] = useState(false);

  return (
    <div>
      <TrialBadge trialStartISO={tenant?.createdAt} />
      {/* Dashboard content */}
      <UpsellModal
        isOpen={upsellOpen}
        featureName="Advanced Tests"
        currentTier="Basic"
        suggestedTier="Pro"
        onClose={() => setUpsellOpen(false)}
      />
    </div>
  );
}
```

### Example: Disable "Add Student" button when over cap

In student list/add page:

```typescript
const [studentError, setStudentError] = useState<any>(null);

const handleAddStudent = async (data) => {
  try {
    const res = await fetch('/api/students', { method: 'POST', body: JSON.stringify(data) });
    if (res.status === 402) {
      // Over cap
      const error = await res.json();
      setStudentError(error);
      setUpsellOpen(true); // Show modal
      return;
    }
    // Success
  } catch (e) {
    console.error(e);
  }
};

return (
  <div>
    {studentError && <p style={{ color: 'red' }}>{studentError.message}</p>}
    <button disabled={studentError?.code === 'upgrade_required'} onClick={handleAddStudent}>
      Add Student
    </button>
  </div>
);
```

### Example: Show storage warning on materials page

In study materials upload page:

```typescript
import { StorageWarning } from '@/components/PlanGating';

export default function StudyMaterials() {
  const [storageUsedGB, setStorageUsedGB] = useState(0);
  const tierStorageGB = 10; // For basic tier

  return (
    <div>
      <StorageWarning usedGB={storageUsedGB} capGB={tierStorageGB} tierName="Basic" />
      {/* Upload form */}
    </div>
  );
}
```

## Verification

1. Trial lock:
   - Create a tenant, wait 14 days (or mock time in test)
   - Access a protected route; should get 402 trial_expired
   - Upgrade subscription; access allowed

2. Student cap:
   - Create 50 students in basic plan
   - Try to add 51st; should get 402 upgrade_required
   - Show upsell modal with suggested tier

3. Storage cap:
   - Upload materials until 10 GB (basic tier)
   - Try to add more; should get 402 storage_cap_reached
   - Show storage warning at 80% usage

4. Frontend:
   - TrialBadge shows countdown (14 days, 13 days, ..., 0 days expired)
   - UpsellModal blocks interaction with clear CTA to /pricing
   - StorageWarning updates in real-time as materials are uploaded

## TODO: Production hardening

- [ ] Compute storage from Materials collection aggregate or S3 listing (currently stubbed at 0 GB)
- [ ] Add nightly job to recompute storage counters for integrity
- [ ] Add rate limiting to prevent bulk upload spam
- [ ] Add audit logging for cap violations and upgrades
- [ ] Integrate with error monitoring (Sentry) for failed gating checks
