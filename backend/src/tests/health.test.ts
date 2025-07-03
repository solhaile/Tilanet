import request from 'supertest';
import app from '../app';

describe('API Health Check', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      message: 'API is running',
      timestamp: expect.any(String),
    });
  });
});
