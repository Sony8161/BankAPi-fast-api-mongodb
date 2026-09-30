def is_palindrome(s: str) -> bool:
    left = 0
    right = len(s) - 1
    
    while left < right:
        if s[left] != s[right]:
            return False  # Mismatch found, not a palindrome
        left += 1
        right -= 1
        
    return True  # All pairs matched

# Example usage:
print(is_palindrome("racecar"))  # Output: True
print(is_palindrome("python"))   # Output: False
