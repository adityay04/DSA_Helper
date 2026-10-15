window.DSA_EXPLANATIONS = {
  "217": {
    approach: "Store each number in a set as you scan the array. If a number is already present, it has appeared before, so a duplicate exists. Otherwise add it and continue.",
    complexity: { time: "O(n) average", space: "O(n)" },
    code: {
      cpp: `#include <unordered_set>
#include <vector>
using namespace std;

class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> seen;
        for (int value : nums) {
            if (seen.count(value)) return true;
            seen.insert(value);
        }
        return false;
    }
};`,
      python: `class Solution:
    def containsDuplicate(self, nums: list[int]) -> bool:
        seen = set()
        for value in nums:
            if value in seen:
                return True
            seen.add(value)
        return False`,
      java: `import java.util.HashSet;
import java.util.Set;

class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int value : nums) {
            if (!seen.add(value)) return true;
        }
        return false;
    }
}`
    }
  },
  "49": {
    approach: "Two words are anagrams exactly when sorting their characters produces the same key. Group words in a hash map by that sorted key, then return the map's groups.",
    complexity: { time: "O(n · k log k)", space: "O(n · k)" },
    code: {
      cpp: `#include <algorithm>
#include <string>
#include <unordered_map>
      #include <utility>
      #include <vector>
using namespace std;

class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (const string& word : strs) {
            string key = word;
            sort(key.begin(), key.end());
            groups[key].push_back(word);
        }

        vector<vector<string>> result;
        for (auto& entry : groups) result.push_back(move(entry.second));
        return result;
    }
};`,
      python: `from collections import defaultdict

class Solution:
    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:
        groups = defaultdict(list)
        for word in strs:
            groups["".join(sorted(word))].append(word)
        return list(groups.values())`,
      java: `import java.util.*;

class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String word : strs) {
            char[] chars = word.toCharArray();
            Arrays.sort(chars);
            String key = new String(chars);
            groups.computeIfAbsent(key, unused -> new ArrayList<>()).add(word);
        }
        return new ArrayList<>(groups.values());
    }
}`
    }
  },
  "128": {
    approach: "Put all values in a set. Only start counting from a value whose predecessor is absent; that value is the beginning of a consecutive run. Walk forward through the set and keep the longest run.",
    complexity: { time: "O(n) average", space: "O(n)" },
    code: {
      cpp: `#include <algorithm>
#include <unordered_set>
#include <vector>
using namespace std;

class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> values(nums.begin(), nums.end());
        int longest = 0;

        for (int value : values) {
            if (values.count(value - 1)) continue;
            int length = 1;
            while (values.count(value + length)) ++length;
            longest = max(longest, length);
        }
        return longest;
    }
};`,
      python: `class Solution:
    def longestConsecutive(self, nums: list[int]) -> int:
        values = set(nums)
        longest = 0
        for value in values:
            if value - 1 in values:
                continue
            length = 1
            while value + length in values:
                length += 1
            longest = max(longest, length)
        return longest`,
      java: `import java.util.HashSet;
import java.util.Set;

class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> values = new HashSet<>();
        for (int value : nums) values.add(value);
        int longest = 0;

        for (int value : values) {
            if (values.contains(value - 1)) continue;
            int length = 1;
            while (values.contains(value + length)) length++;
            longest = Math.max(longest, length);
        }
        return longest;
    }
}`
    }
  },
  "238": {
    approach: "For each index, multiply the product of all values to its left by the product of all values to its right. Build left products in the output array, then sweep backward while maintaining the right product. No division is needed.",
    complexity: { time: "O(n)", space: "O(1) extra, excluding the output array" },
    code: {
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        vector<int> result(nums.size(), 1);
        int prefix = 1;
        for (int i = 0; i < nums.size(); ++i) {
            result[i] = prefix;
            prefix *= nums[i];
        }

        int suffix = 1;
        for (int i = static_cast<int>(nums.size()) - 1; i >= 0; --i) {
            result[i] *= suffix;
            suffix *= nums[i];
        }
        return result;
    }
};`,
      python: `class Solution:
    def productExceptSelf(self, nums: list[int]) -> list[int]:
        result = [1] * len(nums)
        prefix = 1
        for index, value in enumerate(nums):
            result[index] = prefix
            prefix *= value

        suffix = 1
        for index in range(len(nums) - 1, -1, -1):
            result[index] *= suffix
            suffix *= nums[index]
        return result`,
      java: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        int[] result = new int[nums.length];
        int prefix = 1;
        for (int i = 0; i < nums.length; i++) {
            result[i] = prefix;
            prefix *= nums[i];
        }

        int suffix = 1;
        for (int i = nums.length - 1; i >= 0; i--) {
            result[i] *= suffix;
            suffix *= nums[i];
        }
        return result;
    }
}`
    }
  },
  "347": {
    approach: "Count each value's frequency, then place values into buckets indexed by frequency. Scan buckets from highest to lowest and collect values until k elements have been found.",
    complexity: { time: "O(n)", space: "O(n)" },
    code: {
      cpp: `#include <unordered_map>
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> frequency;
        for (int value : nums) ++frequency[value];

        vector<vector<int>> buckets(nums.size() + 1);
        for (const auto& entry : frequency) {
            buckets[entry.second].push_back(entry.first);
        }

        vector<int> result;
        for (int count = static_cast<int>(buckets.size()) - 1;
             count > 0 && result.size() < k; --count) {
            for (int value : buckets[count]) {
                result.push_back(value);
                if (result.size() == k) break;
            }
        }
        return result;
    }
};`,
      python: `from collections import Counter

class Solution:
    def topKFrequent(self, nums: list[int], k: int) -> list[int]:
        frequencies = Counter(nums)
        buckets = [[] for _ in range(len(nums) + 1)]
        for value, count in frequencies.items():
            buckets[count].append(value)

        result = []
        for count in range(len(buckets) - 1, 0, -1):
            for value in buckets[count]:
                result.append(value)
                if len(result) == k:
                    return result
        return result`,
      java: `import java.util.*;

class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> frequencies = new HashMap<>();
        for (int value : nums) {
            frequencies.put(value, frequencies.getOrDefault(value, 0) + 1);
        }

        List<List<Integer>> buckets = new ArrayList<>(nums.length + 1);
        for (int i = 0; i <= nums.length; i++) buckets.add(new ArrayList<>());
        for (Map.Entry<Integer, Integer> entry : frequencies.entrySet()) {
            buckets.get(entry.getValue()).add(entry.getKey());
        }

        int[] result = new int[k];
        int index = 0;
        for (int count = buckets.size() - 1; count > 0 && index < k; count--) {
            for (int value : buckets.get(count)) {
                result[index++] = value;
                if (index == k) break;
            }
        }
        return result;
    }
}`
    }
  }
};
