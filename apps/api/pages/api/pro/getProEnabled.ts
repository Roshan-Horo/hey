import { Errors } from '@hey/data/errors';
import allowCors from '@utils/allowCors';
import { CACHE_AGE } from '@utils/constants';
import createRedisClient from '@utils/createRedisClient';
import prisma from '@utils/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: Errors.NoBody });
  }

  try {
    const redis = createRedisClient();
    const cache = await redis.get(`pro:${id}`);

    if (cache) {
      return res
        .status(200)
        .setHeader('Cache-Control', CACHE_AGE)
        .json({
          success: true,
          cached: true,
          enabled: Boolean(JSON.parse(cache))
        });
    }

    const data = await prisma.pro.findFirst({
      where: { profileId: id as string }
    });
    await redis.set(`pro:${id}`, JSON.stringify(data));

    return res
      .status(200)
      .setHeader('Cache-Control', CACHE_AGE)
      .json({ success: true, enabled: Boolean(data) });
  } catch (error) {
    throw error;
  }
};

export default allowCors(handler);
