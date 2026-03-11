# Production Deployment Notes

## Pre-Deployment Checklist

### Environment Setup
- [ ] Set up `.env` file with API keys
- [ ] Configure Stripe publishable key
- [ ] Configure PayPal client ID
- [ ] Set backend API URL

### Testing
- [ ] Test user registration (buyer + vendor)
- [ ] Test login/logout flow
- [ ] Test product browsing and search
- [ ] Test add to cart functionality
- [ ] Test checkout process
- [ ] Test payment page displays
- [ ] Test admin dashboard access
- [ ] Test vendor portal access

### Backend Integration Required
- Email verification system
- Password reset tokens
- Payment processing (Stripe/PayPal webhooks)
- AI vendor verification (Claude API)
- PDF invoice generation (server-side optional)

### Known Frontend-Only Limitations
- Mock data for products/orders
- No real authentication (uses Zustand state)
- No database persistence
- Email notifications not sent
- Payment processing is simulated

### Post-Backend Integration
1. Replace mock data with API calls
2. Implement real authentication with JWT
3. Connect payment webhooks
4. Set up email service (SendGrid/AWS SES)
5. Configure AI verification service
6. Set up database (MongoDB/PostgreSQL recommended)

## Support
For technical questions: dev@aplusmeddepot.com
