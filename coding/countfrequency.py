'''def countFrequencies(arr):
    values = []
    counts = []
    for num in arr:
        found = False
        for i in range(len(values)):
            if values[i] == num:
                counts[i] += 1
                found = True
                break
        if not found:
            values.append(num)
            counts.append(1)
    for i in range(len(values)):
        print(f"{values[i]}: {counts[i]}")

countFrequencies([4, 2, 4, 7, 2, 4])'''










'''import math

class AreaCalculator:
    def calculateArea(self, a, b=None, isTriangle=False):
        if b is None:
            return math.pi * a * a          # circle
        if isTriangle:
            return 0.5 * a * b              # triangle
        return a * b                        # rectangle

calc = AreaCalculator()
print(calc.calculateArea(5))              # 78.54
print(calc.calculateArea(4, 6))           # 24
print(calc.calculateArea(4, 6, True))     # 12.0'''




'''class MathUtils:
    @staticmethod
    def factorial(n):
        if n < 0:
            raise ValueError("n must be non-negative")
        if n <= 1:
            return 1
        return n * MathUtils.factorial(n - 1)

    @staticmethod
    def fibonacci(n):
        if n < 0:
            raise ValueError("n must be non-negative")
        if n <= 1:
            return n
        return MathUtils.fibonacci(n - 1) + MathUtils.fibonacci(n - 2)

print(MathUtils.factorial(5))   # 120
print(MathUtils.fibonacci(7))   # 13'''






def processScores(scores):
    if not scores:
        raise ValueError("scores cannot be empty")
    n = len(scores)
    mean = sum(scores) / n

    s = sorted(scores)
    mid = n // 2
    median = s[mid] if n % 2 else (s[mid - 1] + s[mid]) / 2

    variance = sum((x - mean) ** 2 for x in scores) / n
    std_dev = variance ** 0.5

    print(f"Mean: {mean:.2f}\nMedian: {median:.2f}\nStd Dev: {std_dev:.2f}")
    return {"mean": mean, "median": median, "std_dev": std_dev}

processScores([88, 92, 75, 64, 95, 81])