import { Errors } from '@hey/data/errors';
import parseJwt from '@hey/lib/parseJwt';
import allowCors from '@utils/allowCors';
import createRedisClient from '@utils/createRedisClient';
import validateLensAccount from '@utils/middlewares/validateLensAccount';
import prisma from '@utils/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = req.headers['x-access-token'] as string;

  if (!(await validateLensAccount(req))) {
    return res
      .status(400)
      .json({ success: false, error: Errors.InvalidAccesstoken });
  }

  try {
    const payload = parseJwt(accessToken);
    const redis = createRedisClient();

    const data = await prisma.membershipNft.upsert({
      where: { id: payload.evmAddress },
      update: { dismissedOrMinted: true },
      create: { id: payload.evmAddress, dismissedOrMinted: true }
    });

    // Delete the cache
    await redis.del(`membership-nft:${payload.evmAddress}`);

    return res.status(200).json({ success: true, result: data });
  } catch (error) {
    throw error;
  }
};

export default allowCors(handler);
