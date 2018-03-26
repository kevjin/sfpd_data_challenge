
# coding: utf-8

# In[1]:


get_ipython().run_line_magic('matplotlib', 'inline')

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt


# In[2]:


#I'm thinking of dispatch time vs type of emergency
#are the supervisor, fire districts different. Is one better than the other? I assume different stations at each district
#original vs final priority differences for different kinds of emergencies
#non life threatening vs threatening hospital time from on-scene
#timestamp vs type of call
#do some classification machine learning

#Im thinking of a pie chart with each percent of emergency
#ask kenny how to plot emergency by time


# In[3]:


import sys


# In[4]:


import folium
from folium.plugins import HeatMap


# In[5]:


data= pd.read_csv("sfpddata.csv")

data.head()


# In[19]:


m = folium.Map([37.7749,-122.4194],zoom_start=11)
geo_data = data[['latitude','longitude','call_type_group']]
geo_data = geo_data.dropna(axis=0,how='any')

m.add_child(HeatMap(geo_data[['latitude','longitude']].values.tolist(), radius = 15))
m.save('emergHeatMap.html')
m


# In[6]:


m = folium.Map([37.7749,-122.4194],zoom_start=11)
geo_data = data[['latitude','longitude','call_type_group']]
geo_data = geo_data.dropna(axis=0,how='any')

geo_data = geo_data[geo_data['call_type_group'].str.contains("Potentially Life-Threatening")]

m.add_child(HeatMap(geo_data[['latitude','longitude']].values.tolist(), radius = 15))
m


# In[17]:


m = folium.Map([37.7749,-122.4194],zoom_start=11)
geo_data = data[['latitude','longitude','call_type_group']]
geo_data = geo_data.dropna(axis=0,how='any')

geo_data = geo_data[geo_data['call_type_group'].str.contains("Fire")]

m.add_child(HeatMap(geo_data[['latitude','longitude']].values.tolist(), radius = 15))
m.save('fireHeatMap.html')
m


# In[8]:


m = folium.Map([37.7749,-122.4194],zoom_start=11)
geo_data = data[['latitude','longitude','call_type_group']]
geo_data = geo_data.dropna(axis=0,how='any')

geo_data = geo_data[geo_data['call_type_group'].str.contains("Non Life-threatening")]

m.add_child(HeatMap(geo_data[['latitude','longitude']].values.tolist(), radius = 15))
m


# In[9]:


target_cols = ['received_timestamp','dispatch_timestamp','zipcode_of_incident']

dispatch_time = data[target_cols]

dispatch_time = dispatch_time.rename(columns={"received_timestamp":"received","dispatch_timestamp":"dispatch","zipcode_of_incident":"zipcode"})

dispatch_time['dispatch_time'] = pd.to_datetime(dispatch_time['dispatch']) - pd.to_datetime(dispatch_time['received'])

dispatch_time.head()


# In[10]:


def graphDispatchTimeVs(variable):

    target_cols = ['received_timestamp','dispatch_timestamp',variable]

    dispatch_time = data[target_cols]

    dispatch_time['dispatch_time'] = pd.to_datetime(dispatch_time['dispatch_timestamp']) - pd.to_datetime(dispatch_time['received_timestamp'])

    dispatch_time.head()
    dispatch_time.sort_values(by=variable)
    zipcodes = dict(tuple(dispatch_time.groupby(variable)))

    zipMeanDispatchTime = []
    zipKeys = []
    for zipcode in zipcodes:
        zipKeys.append(str(zipcode))
        zipMeanDispatchTime.append(zipcodes[zipcode]["dispatch_time"].mean().total_seconds())
    fig=plt.figure(figsize=(18, 16), dpi= 80, facecolor='w', edgecolor='k')
    plt.bar(zipKeys, zipMeanDispatchTime)
    plt.savefig(variable+'_vs_dispatch_time.png')


# In[11]:


graphDispatchTimeVs('fire_prevention_district')


# In[43]:


target_cols = ['received_timestamp','call_type_group']

received_vs_type = data[target_cols]

received_vs_type = received_vs_type.rename(columns={"received_timestamp":"received","call_type_group":"emergency_type"})

received_vs_type['time_of_day'] = pd.to_datetime(received_vs_type['received'])
received_vs_type['date'] = pd.to_datetime(received_vs_type['received']).dt.date
received_vs_type['time_of_day'] = pd.to_datetime(received_vs_type['time_of_day']) - pd.to_datetime(received_vs_type['date'])
mapping = {'Non Life-threatening':1, 'Potentially Life-Threatening':2, 'Alarm':3,'Fire':4}
received_vs_type = received_vs_type.replace({"emergency_type":mapping})

receivedTypes = dict(tuple(received_vs_type.groupby("emergency_type")))

averageTime = []
receivedKeys = []
for series in receivedTypes:
    receivedKeys.append(str(series))
    averageTime.append(receivedTypes[series]["time_of_day"].mean().total_seconds())
received_vs_type.head()


# In[ ]:


# received_vs_type.plot.pie(y='emergency_type')


# In[41]:


fig=plt.figure(figsize=(18, 16), dpi= 80, facecolor='w', edgecolor='k')
plt.scatter(receivedKeys, averageTime)
plt.savefig('average_time_of_emergency.png')


# In[14]:


target_cols = ['received_timestamp','dispatch_timestamp','call_type_group']


# In[15]:


#crashes.groupby(crashes['datetime'].dt.hour)['num'].sum()

dispatch_time.sort_values(by="zipcode")


# In[1]:


emergencies = dict(tuple(dispatch_time_emergency.groupby("emergency_type")))

emergencyDispatchTime = []
emergencyKeys = []
for emergency in emergencies:
    emergencyKeys.append(str(emergency))
    emergencyDispatchTime.append(emergencies[emergency]["dispatch_time"].mean().total_seconds())
fig=plt.figure(figsize=(18, 16), dpi= 80, facecolor='w', edgecolor='k')
plt.bar(emergencyKeys, emergencyDispatchTime)
plt.savefig('emergency_vs_dispatch_time.png')


# In[ ]:


zipcodes = dict(tuple(dispatch_time.groupby("zipcode")))

zipMeanDispatchTime = []
zipKeys = []
for zipcode in zipcodes:
    zipKeys.append(str(zipcode))
    zipMeanDispatchTime.append(zipcodes[zipcode]["dispatch_time"].mean().total_seconds())
fig=plt.figure(figsize=(18, 16), dpi= 80, facecolor='w', edgecolor='k')
plt.bar(zipKeys, zipMeanDispatchTime)
plt.savefig('zipcode_vs_dispatch_time.png')


# In[ ]:


zipKeys


# In[ ]:


zipMeanDispatchTime


# In[ ]:


zipKeys

