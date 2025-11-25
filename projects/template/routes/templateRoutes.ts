import { FastifyPluginAsync } from 'fastify';

const templateRoutes: FastifyPluginAsync = async (fastify, options) => {
  
  fastify.get('/template', async (request, reply) => {
      return reply.code(200).send({ text: 'template' });
  });
};

export default templateRoutes;