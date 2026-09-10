import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ConfigurationModule } from '@app/config';
import { HealthModule, API_PREFIX } from '@app/common';
describe('HTTP scaffold', () => {
  it('serves health but no business endpoints', async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigurationModule.forService('api-gateway'), HealthModule],
    }).compile();
    const app = module.createNestApplication();
    app.setGlobalPrefix(API_PREFIX);
    await app.init();
    try {
      await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect(({ body }: { body: { scope: string } }) => expect(body.scope).toBe('liveness'));
      await request(app.getHttpServer()).post('/api/v1/auth/login').expect(404);
    } finally {
      await app.close();
    }
  });
});
