import sys

# Read files in lines
def read_file(file_name): 
    with open(file_name) as f:
        return f.readlines()

# Return Sampling Period of the lines
# Sampling period: ____ ms
def get_sampling_rate_of_lines(lines):
    for line in lines:
        words = str(line).split()
        if ("Sampling" in words  and "Period:" in words and "ms" in words):
            return int(words[2])

# Return minimum and maximal wavelength of the detector of the lines
# Wavelength Range: ___ to ___ nm
def get_min_and_max_wavelength_of_lines(lines):
    for line in range(0, len(lines)):
        words = str(lines[line]).split()
        if ("Wavelength" in words  and "Range:" in words and "nm" in words and "to" in words):
            old_words = str(lines[line-1]).split()
            # Check if previous lines contain sampling rate to confirm it is wavelength range of the detector
            # PS. Wavelength Range is also in DAD Display Format:
            if("Sampling" in old_words and "ms" in old_words):
                return int(words[2]), int(words[4])
            else:
                continue

lines = []
file = sys.argv[1]
lines = read_file(file)
sampling_rate = get_sampling_rate_of_lines(lines)
min_wavelength, max_wavelength = get_min_and_max_wavelength_of_lines(lines)
print(sampling_rate, min_wavelength, max_wavelength)
