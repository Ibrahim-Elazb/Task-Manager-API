def calculate_average(num_courses):
    total = 0
    for i in range(num_courses):
        score = float(input(f"Enter score for course {i + 1}: "))
        total += score
    return total / num_courses

def calculate_letter_grade(average):
    if average >= 90:
        return "A"
    elif average >= 80:
        return "B"
    elif average >= 70:
        return "C"
    elif average >= 60:
        return "D"
    else:
        return "F"

def get_max_average(studentsList):
    max_average = 0

    for student in studentsList:
        average = student[1]
        if average > max_average:
            max_average = average
    return max_average

def get_min_average(studentsList):
    min_average = float('inf')  # Set an initial value to infinity

    for student in studentsList:
        average = student[1]
        if average < min_average:
            min_average = average
    return min_average

def get_class_average(studentsList):
    class_total = 0

    for student in studentsList:
        class_total += student[1]

    return class_total / len(studentsList)

num_students = int(input("Enter the number of students: "))

students = []

for i in range(num_students):
    name = input(f"Enter name for student {i + 1}: ")
    num_courses = int(input("Enter the number of courses for this student: "))
    average_score = calculate_average(num_courses)
    letter_grade = calculate_letter_grade(average_score)
    students.append((name, average_score, letter_grade))

print("\nAverage scores and letter grades for each student:")
for name, average, letter_grade in students:
    print(f"{name}: Average = {average}, Letter Grade = {letter_grade}")

max_average = get_max_average(students)
min_average = get_min_average(students)
class_average = get_class_average(students)

print("\nStatistics:")
print(f"Max Average: {max_average}")
print(f"Min Average: {min_average}")
print(f"Class Average: {class_average}")
