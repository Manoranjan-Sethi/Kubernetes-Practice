
## 🚀 Day 7 – Volumes in Kubernetes Pods

### 🔹 Why Volumes?
By default, container storage is **ephemeral** – meaning if a pod restarts or the container is killed, **all data is lost**.  
To overcome this, Kubernetes allows us to define **volumes** at the Pod level.

---

### 🛠️ What I Did
1. Created a **MongoDB Deployment** with environment variables for authentication.  

**`mongoDeploy.yaml`**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  labels:
    app: mongodb
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
        - name: mongodb
          image: mongo:6.0
          ports:
            - containerPort: 27017
          env:
            - name: MONGO_INITDB_ROOT_USERNAME
              value: admin
            - name: MONGO_INITDB_ROOT_PASSWORD
              value: admin
````
2. Forwarded the port and connected MongoDB Compass:

```bash
kubectl port-forward svc/mongodb-service 32000:27017
```

   Logged in with username/password → Inserted sample data.

3. Verified data was stored in `/data/db` inside the container.

   ```bash
   kubectl exec -it <mongodb-pod> -- bash
   ps aux   # list processes
   kill <PID>   # simulate container crash
   ```

4. Data **was lost** after killing the container → proves container-level storage is not reliable.

---

### ✅ Solution: Pod-Level Volumes

Updated the Deployment with a **volumeMount** using `emptyDir`.

**`mongodb-with-volume.yaml`**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
        - name: mongodb
          image: mongo:6.0
          ports:
            - containerPort: 27017
          volumeMounts:
            - name: mongo-volume
              mountPath: /data/db
      volumes:
        - name: mongo-volume
          emptyDir: {}
```

Inserted data again → killed the container → **data persisted inside the pod**.

⚠️ However, if the pod itself is deleted/rescheduled, data is still lost.
This is where **Persistent Volumes (PV) and PVC** come in.

---

---

### Persistent Volumes (PV) & Persistent Volume Claims (PVC)

### 🔹 Why PV & PVC?

* Pod-level volumes (`emptyDir`) still lose data if the pod is rescheduled.
* **PV (Persistent Volume):** Cluster-wide storage resource.
* **PVC (Persistent Volume Claim):** Request for storage made by pods.
* Pods mount PVCs → which bind to PVs → ensuring data persists beyond pod lifecycle.

---

### 🛠️ What I Did

1. **Created a Persistent Volume** with hostPath (for demo on KIND cluster).

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: local-pv
  labels:
    app: local
spec:
  capacity:
    storage: 200Mi
  accessModes:
    - ReadWriteOnce
  storageClassName: local-storage
  hostPath:
    path: "/mnt/data"
```

2. **Created a Persistent Volume Claim (PVC)** to request storage.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: local-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 200Mi
  storageClassName: local-storage
```

3. **Updated MongoDB Deployment** to use PVC.

```yaml
volumes:
  - name: mongo-volume
    persistentVolumeClaim:
      claimName: local-pvc
```

4. Inserted documents using MongoDB Compass.

5. Deleted the MongoDB pod → Kubernetes recreated it (replica: 1).
   ✅ The data was still there → persistence confirmed.

---

### ⚠️ Limitation

* Using **hostPath**, data stays on a single node.
* If the pod is rescheduled to another node, it **cannot access old data**.
* Production systems use **dynamic provisioning** with cloud storage (e.g., AWS EBS, Azure Disk, GCP Persistent Disk).

---

## 📌 Key Learnings

* Pod volumes (`emptyDir`) provide persistence at container level but fail if the pod is deleted.
* PV & PVC allow persistence beyond pod lifecycle, ensuring data durability.
* Next step → **StorageClasses & Dynamic Provisioning** for multi-node scalable persistence.

---

\#Kubernetes #DevOps #PersistentVolumes #LearningInPublic


