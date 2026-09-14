import time
from typing import Any, Optional, Dict

class GraphCacheService:
    def __init__(self, default_ttl: int = 300):
        self.default_ttl = default_ttl
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.hits: int = 0
        self.misses: int = 0

    def get(self, key: str) -> Optional[Any]:
        entry = self._cache.get(key)
        if not entry:
            self.misses += 1
            return None

        if entry["expires_at"] < time.time():
            del self._cache[key]
            self.misses += 1
            return None

        self.hits += 1
        return entry["value"]

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        duration = ttl if ttl is not None else self.default_ttl
        self._cache[key] = {
            "value": value,
            "expires_at": time.time() + duration,
            "created_at": time.time()
        }

    def invalidate(self, prefix: Optional[str] = None) -> int:
        if not prefix:
            count = len(self._cache)
            self._cache.clear()
            return count

        keys_to_del = [k for k in self._cache.keys() if k.startswith(prefix)]
        for k in keys_to_del:
            del self._cache[k]
        return len(keys_to_del)

    def get_metrics(self) -> Dict[str, Any]:
        total = self.hits + self.misses
        rate = round((self.hits / total * 100), 1) if total > 0 else 0.0
        return {
            "engine": "In-Memory Micro-Cache Layer (Redis-Compatible)",
            "active_cached_keys": len(self._cache),
            "hits": self.hits,
            "misses": self.misses,
            "hit_ratio_pct": rate,
            "status": "ACCELERATED"
        }

cache_service = GraphCacheService()
