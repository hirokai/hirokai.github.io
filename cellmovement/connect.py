import csv
import numpy as np


def norm_sq(a, b):
    return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2


# Connecting points in two adjacent frames.
# Pick nearest neighbors in the frames.
# Return pairs of two IDs
def connect(fr1, fr2):
    dist_th = 50
    ps = []
    for p2 in fr2:
        nearest = min(fr1, key=lambda p1: norm_sq(p1, p2))
        if norm_sq(nearest, p2) < dist_th**2:
            ps.append([nearest[2],p2[2]])
    return ps


# Dict vs holds an array of coords([x,y]) with slice number as a key.
vs = {}

with open('coords.csv', 'rU') as f:
    reader = csv.reader(f, delimiter=',')
    reader.next()
    for i, row in enumerate(reader):
        sl = int(row[3])
        if not sl in vs:
            vs[sl] = []
        vs[sl].append(map(float, row[1:3])+[int(row[0])])

ks = range(1, max(vs.keys())+1)

cs = []
for i, k in enumerate(ks):
    v = vs[k]
    if i >= 1:
        v_prev = vs[ks[i - 1]]
        cs.append(map(lambda a: a + [ks[i-1],ks[i]], connect(v_prev, v)))
    else:
        cs.append([])

with open('connection.csv','wb') as f:
    writer = csv.writer(f)
    writer.writerow(['id','from','to','from_frame','to_frame'])
    for i, row in enumerate(reduce(lambda x,y: x+y,cs)):
        writer.writerow([str(i)]+map(str,row))
