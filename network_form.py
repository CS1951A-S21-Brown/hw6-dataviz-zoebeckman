import pandas as pd
import json
import pickle
path = 'data/netflix.csv'
df = pd.read_csv(path)

df = df[df['type'] == "Movie"]
df = df[df['cast'].notna()]
df = df[df['release_year'] == 2019]
df = df[df['listed_in'].str.find("International Movies") == -1]
data = df[df['listed_in'].str.find("International TV") == -1]
actor_dict = {}
movie_dict = {}
network_dict = {}
node_list = []
link_list = []
index_a = 1
for index, row in data.iterrows():
    castList = row['cast'].split(", ")
    if len(castList) > 1:
        title = row['title']
        for j in range(len(castList)):
            actor = castList[j]
            if actor not in actor_dict:
                actor_dict[actor] = index_a 
                index_a += 1
        movie_dict[title] = castList
for actor in actor_dict:
    node_list.append({"id": actor_dict[actor],"name": actor})
for movie in movie_dict:
    actorsIn = movie_dict[movie]
    for x in range(len(actorsIn)):
        for y in range(x+1,len(actorsIn)):
            if x != y:
                link_list.append({"source": actor_dict[actorsIn[x]], "target": actor_dict[actorsIn[y]]})
toReturn = {"nodes": node_list, "links": link_list}
json.dump(toReturn, open("networkdata.json","w"))
