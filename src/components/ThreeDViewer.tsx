import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Material {
  material: string;
  name: string;
  condition: string;
}

interface ThreeDViewerProps {
  structureType: string;
  materials: Material[];
  width?: number;
  height?: number;
}

export default function ThreeDViewer({ structureType, materials, width = 400, height = 300 }: ThreeDViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);
  
  // Define materialColors inside or use a stable reference
  const materialColors: Record<string, number> = {
    'Steel': 0x8B8C89,
    'Wood': 0x8B4513,
    'Glass': 0x87CEEB,
    'Metal': 0x708090,
    'Ceramic': 0xF5F5DC,
    'Concrete': 0x808080
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xe0e0e0 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create structure based on type
    createStructure(scene, structureType, materials);

    // Animation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      // Rotate camera around the structure
      const time = Date.now() * 0.001;
      camera.position.x = Math.cos(time * 0.5) * 15;
      camera.position.z = Math.sin(time * 0.5) * 15;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    const currentMount = mountRef.current;

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [structureType, materials, width, height, materialColors]); // Added materialColors as it's defined inside

  const createStructure = (scene: THREE.Scene, type: string, _materials: Material[]) => {
    // Clear existing structure (except ground)
    const objectsToRemove: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child !== scene.children.find(c => c instanceof THREE.Mesh && (c as THREE.Mesh).geometry instanceof THREE.PlaneGeometry)) {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach(obj => scene.remove(obj));

    switch (type) {
      case 'tiny-house':
        createTinyHouse(scene, materialColors);
        break;
      case 'garden-shed':
        createGardenShed(scene, materialColors);
        break;
      case 'greenhouse':
        createGreenhouse(scene, materialColors);
        break;
      case 'bus-shelter':
        createBusShelter(scene, materialColors);
        break;
      case 'playhouse':
        createPlayhouse(scene, materialColors);
        break;
      case 'storage-unit':
        createStorageUnit(scene, materialColors);
        break;
      default:
        createDefaultStructure(scene, materialColors);
    }
  };

  const createTinyHouse = (scene: THREE.Scene, colors: Record<string, number>) => {
    // Foundation
    const foundationGeometry = new THREE.BoxGeometry(8, 0.5, 8);
    const foundationMaterial = new THREE.MeshLambertMaterial({ color: colors['Concrete'] });
    const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
    foundation.position.y = 0.25;
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    scene.add(foundation);

    // Walls
    const wallMaterial = new THREE.MeshLambertMaterial({ color: colors['Wood'] });
    
    // Front wall
    const frontWallGeometry = new THREE.BoxGeometry(8, 4, 0.3);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, 2.5, 3.85);
    frontWall.castShadow = true;
    scene.add(frontWall);

    // Back wall
    const backWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    backWall.position.set(0, 2.5, -3.85);
    backWall.castShadow = true;
    scene.add(backWall);

    // Side walls
    const sideWallGeometry = new THREE.BoxGeometry(7.7, 4, 0.3);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-3.85, 2.5, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.castShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(3.85, 2.5, 0);
    rightWall.rotation.y = Math.PI / 2;
    rightWall.castShadow = true;
    scene.add(rightWall);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(6, 3, 4);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: colors['Metal'] });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 5.5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);

    // Door
    const doorGeometry = new THREE.BoxGeometry(1.5, 2.5, 0.2);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.75, 3.85);
    scene.add(door);

    // Windows
    const windowMaterial = new THREE.MeshLambertMaterial({ color: colors['Glass'], transparent: true, opacity: 0.7 });
    const windowGeometry = new THREE.BoxGeometry(1.5, 1.5, 0.1);
    
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(-2, 3, 3.85);
    scene.add(window1);

    const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
    window2.position.set(2, 3, 3.85);
    scene.add(window2);
  };

  const createGardenShed = (scene: THREE.Scene, colors: Record<string, number>) => {
    // Foundation
    const foundationGeometry = new THREE.BoxGeometry(4, 0.3, 3);
    const foundationMaterial = new THREE.MeshLambertMaterial({ color: colors['Concrete'] });
    const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
    foundation.position.y = 0.15;
    foundation.castShadow = true;
    scene.add(foundation);

    // Walls
    const wallMaterial = new THREE.MeshLambertMaterial({ color: colors['Wood'] });
    
    // Front wall with door opening
    const frontWallGeometry = new THREE.BoxGeometry(4, 3, 0.2);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, 1.8, 1.4);
    frontWall.castShadow = true;
    scene.add(frontWall);

    // Back wall
    const backWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    backWall.position.set(0, 1.8, -1.4);
    backWall.castShadow = true;
    scene.add(backWall);

    // Side walls
    const sideWallGeometry = new THREE.BoxGeometry(2.8, 3, 0.2);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-1.9, 1.8, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.castShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(1.9, 1.8, 0);
    rightWall.rotation.y = Math.PI / 2;
    rightWall.castShadow = true;
    scene.add(rightWall);

    // Roof
    const roofGeometry = new THREE.BoxGeometry(4.5, 0.2, 3.5);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: colors['Metal'] });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 3.2;
    roof.rotation.x = -0.1;
    roof.castShadow = true;
    scene.add(roof);

    // Door
    const doorGeometry = new THREE.BoxGeometry(1.2, 2, 0.1);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.2, 1.4);
    scene.add(door);
  };

  const createGreenhouse = (scene: THREE.Scene, colors: Record<string, number>) => {
    // Frame structure
    const frameMaterial = new THREE.MeshLambertMaterial({ color: colors['Steel'] });
    
    // Base frame
    const baseFrameGeometry = new THREE.BoxGeometry(6, 0.2, 4);
    const baseFrame = new THREE.Mesh(baseFrameGeometry, frameMaterial);
    baseFrame.position.y = 0.1;
    baseFrame.castShadow = true;
    scene.add(baseFrame);

    // Vertical posts
    const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3);
    const posts = [
      { x: -2.8, z: -1.8 },
      { x: 2.8, z: -1.8 },
      { x: -2.8, z: 1.8 },
      { x: 2.8, z: 1.8 }
    ];

    posts.forEach(pos => {
      const post = new THREE.Mesh(postGeometry, frameMaterial);
      post.position.set(pos.x, 1.6, pos.z);
      post.castShadow = true;
      scene.add(post);
    });

    // Roof frame
    const roofFrameGeometry = new THREE.BoxGeometry(6.5, 0.1, 4.5);
    const roofFrame = new THREE.Mesh(roofFrameGeometry, frameMaterial);
    roofFrame.position.y = 3.2;
    roofFrame.rotation.x = 0.2;
    scene.add(roofFrame);

    // Glass panels
    const glassMaterial = new THREE.MeshLambertMaterial({ 
      color: colors['Glass'], 
      transparent: true, 
      opacity: 0.6 
    });

    // Side glass panels
    const sideGlassGeometry = new THREE.BoxGeometry(0.05, 2.5, 1.8);
    const leftGlass = new THREE.Mesh(sideGlassGeometry, glassMaterial);
    leftGlass.position.set(-2.8, 1.5, 0);
    scene.add(leftGlass);

    const rightGlass = new THREE.Mesh(sideGlassGeometry, glassMaterial);
    rightGlass.position.set(2.8, 1.5, 0);
    scene.add(rightGlass);

    // Front glass panels
    const frontGlassGeometry = new THREE.BoxGeometry(2.5, 2.5, 0.05);
    const frontGlass = new THREE.Mesh(frontGlassGeometry, glassMaterial);
    frontGlass.position.set(-1.5, 1.5, 1.8);
    scene.add(frontGlass);

    const frontGlass2 = new THREE.Mesh(frontGlassGeometry, glassMaterial);
    frontGlass2.position.set(1.5, 1.5, 1.8);
    scene.add(frontGlass2);

    // Roof glass panels
    const roofGlassGeometry = new THREE.BoxGeometry(6, 0.05, 4);
    const roofGlass = new THREE.Mesh(roofGlassGeometry, glassMaterial);
    roofGlass.position.y = 3.2;
    roofGlass.rotation.x = 0.2;
    scene.add(roofGlass);
  };

  const createBusShelter = (scene: THREE.Scene, colors: Record<string, number>) => {
    // Foundation
    const foundationGeometry = new THREE.BoxGeometry(3, 0.2, 2);
    const foundationMaterial = new THREE.MeshLambertMaterial({ color: colors['Concrete'] });
    const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
    foundation.position.y = 0.1;
    foundation.castShadow = true;
    scene.add(foundation);

    // Steel frame
    const frameMaterial = new THREE.MeshLambertMaterial({ color: colors['Steel'] });
    
    // Vertical posts
    const postGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2.5);
    const posts = [
      { x: -1.3, z: -0.8 },
      { x: 1.3, z: -0.8 },
      { x: -1.3, z: 0.8 },
      { x: 1.3, z: 0.8 }
    ];

    posts.forEach(pos => {
      const post = new THREE.Mesh(postGeometry, frameMaterial);
      post.position.set(pos.x, 1.35, pos.z);
      post.castShadow = true;
      scene.add(post);
    });

    // Top frame
    const topFrameGeometry = new THREE.BoxGeometry(3, 0.1, 2);
    const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
    topFrame.position.y = 2.5;
    topFrame.castShadow = true;
    scene.add(topFrame);

    // Roof
    const roofGeometry = new THREE.BoxGeometry(3.5, 0.1, 2.5);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: colors['Metal'] });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 2.6;
    roof.rotation.x = -0.05;
    roof.castShadow = true;
    scene.add(roof);

    // Glass panels (back only)
    const glassMaterial = new THREE.MeshLambertMaterial({ 
      color: colors['Glass'], 
      transparent: true, 
      opacity: 0.7 
    });
    const backGlassGeometry = new THREE.BoxGeometry(2.5, 2, 0.05);
    const backGlass = new THREE.Mesh(backGlassGeometry, glassMaterial);
    backGlass.position.set(0, 1.5, -0.8);
    scene.add(backGlass);
  };

  const createPlayhouse = (scene: THREE.Scene, colors: Record<string, number>) => {
    // Base
    const baseGeometry = new THREE.BoxGeometry(2.5, 0.2, 2);
    const baseMaterial = new THREE.MeshLambertMaterial({ color: colors['Wood'] });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.1;
    base.castShadow = true;
    scene.add(base);

    // Walls
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6B6B }); // Colorful for kids
    
    // Front wall
    const frontWallGeometry = new THREE.BoxGeometry(2.5, 2, 0.15);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, 1.2, 0.9);
    frontWall.castShadow = true;
    scene.add(frontWall);

    // Back wall
    const backWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    backWall.position.set(0, 1.2, -0.9);
    backWall.castShadow = true;
    scene.add(backWall);

    // Side walls
    const sideWallGeometry = new THREE.BoxGeometry(1.7, 2, 0.15);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-1.15, 1.2, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.castShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(1.15, 1.2, 0);
    rightWall.rotation.y = Math.PI / 2;
    rightWall.castShadow = true;
    scene.add(rightWall);

    // Roof (colorful)
    const roofGeometry = new THREE.ConeGeometry(1.4, 1.5, 4);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x4ECDC4 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 2.5;
    roof.castShadow = true;
    scene.add(roof);

    // Door (kid-sized)
    const doorGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.1);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD93D });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 0.8, 0.9);
    scene.add(door);

    // Windows (round)
    const windowMaterial = new THREE.MeshLambertMaterial({ color: colors['Glass'], transparent: true, opacity: 0.8 });
    const windowGeometry = new THREE.CircleGeometry(0.3, 8);
    
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(-0.6, 1.2, 0.9);
    scene.add(window1);

    const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
    window2.position.set(0.6, 1.2, 0.9);
    scene.add(window2);
  };

  const createStorageUnit = (scene: THREE.Scene, colors: Record<string, number>) => {
    // Foundation
    const foundationGeometry = new THREE.BoxGeometry(3, 0.2, 2.5);
    const foundationMaterial = new THREE.MeshLambertMaterial({ color: colors['Concrete'] });
    const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
    foundation.position.y = 0.1;
    foundation.castShadow = true;
    scene.add(foundation);

    // Walls
    const wallMaterial = new THREE.MeshLambertMaterial({ color: colors['Metal'] });
    
    // Front wall with roll-up door
    const frontWallGeometry = new THREE.BoxGeometry(3, 2.5, 0.15);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, 1.35, 1.2);
    frontWall.castShadow = true;
    scene.add(frontWall);

    // Back wall
    const backWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    backWall.position.set(0, 1.35, -1.2);
    backWall.castShadow = true;
    scene.add(backWall);

    // Side walls
    const sideWallGeometry = new THREE.BoxGeometry(2.2, 2.5, 0.15);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-1.4, 1.35, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.castShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(1.4, 1.35, 0);
    rightWall.rotation.y = Math.PI / 2;
    rightWall.castShadow = true;
    scene.add(rightWall);

    // Roof
    const roofGeometry = new THREE.BoxGeometry(3.2, 0.15, 2.7);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: colors['Metal'] });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 2.6;
    roof.castShadow = true;
    scene.add(roof);

    // Roll-up door representation
    const doorGeometry = new THREE.BoxGeometry(2.5, 2, 0.05);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.2, 1.2);
    scene.add(door);
  };

  const createDefaultStructure = (scene: THREE.Scene, colors: Record<string, number>) => {
    // Simple box structure as fallback
    const geometry = new THREE.BoxGeometry(4, 3, 4);
    const material = new THREE.MeshLambertMaterial({ color: colors['Wood'] });
    const box = new THREE.Mesh(geometry, material);
    box.position.y = 1.5;
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);
  };

  return (
    <div 
      ref={mountRef} 
      className="rounded-lg overflow-hidden shadow-inner"
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}
