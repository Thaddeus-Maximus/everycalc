import csv
import json

classes = None
zones = {}
with open('isofits.csv', newline='') as csvfile:
	lines = csvfile.readlines()
	classes = lines[0].strip().split(',')[2:]
	print(classes)
	i = 1
	while i < len(lines):
		data_low = lines[i+1].strip().split(',')
		data_hi = lines[i].strip().split(',')
		zones[str(data_low[1])] = {}
		for colidx, icls in enumerate(classes):
			print(str(data_hi[1]), icls, data_hi[2+colidx])
			if data_low[2+colidx] != '':
				zones[str(data_low[1])][icls] = [float(data_low[2+colidx]), float(data_hi[2+colidx])]
			else:
				zones[str(data_low[1])][icls] = [float("NaN"), float("NaN")]
		i+=2

with open('isofits.js', 'w') as jsfile:
	jsfile.write("ISOFIT_CLASSES = ")
	jsfile.write(json.dumps(classes))
	jsfile.write("\n");
	jsfile.write("ISOFIT_ZONES = ")
	jsfile.write(json.dumps(zones))
	jsfile.write("\n");