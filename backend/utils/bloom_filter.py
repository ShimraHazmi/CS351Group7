"""
Bloom filter utilities for caching and duplicate detection.

- BloomFilter: in-memory implementation (single-process).
- RedisBloomFilter: distributed implementation using Redis bit operations.

Dependencies:
    pip install mmh3 bitarray redis
"""

import math
import mmh3  # MurmurHash3
from bitarray import bitarray

try:
    import redis
except ImportError:
    redis = None


class BloomFilter:
    """
    In-memory Bloom filter.
    Good for dev/testing or single-process apps.
    """

    def __init__(self, items_count: int, fp_prob: float):
        """
        :param items_count: expected number of items to store
        :param fp_prob: acceptable false positive probability (e.g., 0.01 for 1%)
        """
        self.fp_prob = fp_prob
        self.size = self._get_size(items_count, fp_prob)
        self.hash_count = self._get_hash_count(self.size, items_count)
        self.bit_array = bitarray(self.size)
        self.bit_array.setall(0)

    def add(self, item: str):
        """Add an item to the filter."""
        for i in range(self.hash_count):
            digest = mmh3.hash(item, i) % self.size
            self.bit_array[digest] = 1

    def contains(self, item: str) -> bool:
        """Check if an item is possibly in the filter."""
        for i in range(self.hash_count):
            digest = mmh3.hash(item, i) % self.size
            if self.bit_array[digest] == 0:
                return False
        return True

    @staticmethod
    def _get_size(n: int, p: float) -> int:
        """Return size of bit array (m)."""
        m = -(n * math.log(p)) / (math.log(2) ** 2)
        return int(m)

    @staticmethod
    def _get_hash_count(m: int, n: int) -> int:
        """Return number of hash functions (k)."""
        k = (m / n) * math.log(2)
        return int(k)


class RedisBloomFilter:
    """
    Redis-backed Bloom filter.
    Useful for multi-worker Django apps where state must be shared.
    """

    def __init__(self, redis_client, key: str, items_count: int, fp_prob: float):
        if not redis:
            raise ImportError("redis-py is required for RedisBloomFilter")
        self.redis = redis_client
        self.key = key
        self.size = BloomFilter._get_size(items_count, fp_prob)
        self.hash_count = BloomFilter._get_hash_count(self.size, items_count)

    def add(self, item: str):
        """Add an item to the filter (sets bits in Redis)."""
        for i in range(self.hash_count):
            digest = mmh3.hash(item, i) % self.size
            self.redis.setbit(self.key, digest, 1)

    def contains(self, item: str) -> bool:
        """Check if an item is possibly in the filter."""
        for i in range(self.hash_count):
            digest = mmh3.hash(item, i) % self.size
            if self.redis.getbit(self.key, digest) == 0:
                return False
        return True