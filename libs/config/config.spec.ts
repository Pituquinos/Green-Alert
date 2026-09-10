import { validateEnvironment } from './index';
describe('environment validation', () => {
  it('uses gateway defaults without database credentials', () => {
    expect(validateEnvironment({}, 'api-gateway').PORT).toBe(3000);
  });
  it('rejects invalid ports and missing service dependencies', () => {
    expect(() => validateEnvironment({ API_GATEWAY_PORT: '0' }, 'api-gateway')).toThrow();
    expect(() => validateEnvironment({}, 'reports-service')).toThrow();
  });
  it('selects only the database owned by the service', () => {
    const config = validateEnvironment(
      {
        MONGO_REPORTS_URI: 'mongodb://localhost/greenalert_reports',
        MONGO_AUTH_URI: 'mongodb://localhost/greenalert_auth',
        RABBITMQ_URI: 'amqp://localhost',
      },
      'reports-service',
    );
    expect(config.MONGO_URI).toBe('mongodb://localhost/greenalert_reports');
  });
});
