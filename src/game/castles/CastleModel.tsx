import type { CastleStyle } from '../../types/game.ts'
import { Banner, Crystal, Gate, Keep, Tower, Wall } from './parts.tsx'

export function CastleModel({ style }: { style: CastleStyle }) {
  if (style === 'azure') return <AzureCastle />
  if (style === 'timber') return <TimberCastle />
  if (style === 'sand') return <SandCastle />
  if (style === 'river') return <RiverCastle />
  if (style === 'fortress') return <FortressCastle />
  if (style === 'mage') return <MageCastle />
  return <IvoryCastle />
}

function AzureCastle() {
  const stone = '#8e97a4'
  const roof = '#2c4d86'
  return (
    <group>
      <Wall position={[0, 1.3, -0.4]} size={[6.2, 2.6, 5.2]} stone={stone} />
      <Tower position={[-2.7, 0, 2]} height={4.6} radius={0.75} stone={stone} roof={roof} />
      <Tower position={[2.7, 0, 2]} height={4.6} radius={0.75} stone={stone} roof={roof} />
      <Tower position={[-2.7, 0, -2.4]} height={5.2} radius={0.7} stone={stone} roof={roof} />
      <Tower position={[2.7, 0, -2.4]} height={5.4} radius={0.7} stone={stone} roof={roof} />
      <Keep position={[0, 0, -0.6]} height={6.4} radius={1.15} stone={stone} roof={roof} />
      <Gate position={[0, 0, 2.7]} width={1.5} height={2.2} stone={stone} />
      <Banner position={[-2.7, 5.4, 2]} color="#1e4f8c" seed={1} />
      <Banner position={[2.7, 5.4, 2]} color="#1e4f8c" seed={2} />
    </group>
  )
}

function TimberCastle() {
  const stone = '#7a6a58'
  const wood = '#6a432c'
  const roof = '#3e6b3a'
  return (
    <group>
      <Wall position={[0, 1, 0]} size={[6.4, 2, 4.4]} stone={stone} />
      <Wall position={[0, 2.3, 0]} size={[5.6, 0.8, 3.8]} stone={wood} />
      <Tower position={[-2.4, 0, 1.6]} height={3.6} radius={0.7} stone={wood} roof={roof} sides={6} />
      <Tower position={[2.5, 0, 1.5]} height={5.5} radius={0.72} stone={stone} roof={roof} sides={6} />
      <Tower position={[0.2, 0, -1.8]} height={4.2} radius={0.85} stone={stone} roof={roof} sides={6} />
      <Gate position={[0, 0, 2.3]} width={1.6} height={2} stone={wood} />
      <Banner position={[2.5, 6.2, 1.5]} color="#2f6a38" seed={3} />
    </group>
  )
}

function SandCastle() {
  const stone = '#c4a37a'
  const roof = '#8c3b32'
  return (
    <group>
      <Wall position={[0.4, 1.4, -0.2]} size={[5.4, 2.8, 5]} stone={stone} />
      <Tower position={[-2.2, 0, 1.8]} height={4.2} radius={0.85} stone={stone} roof={roof} />
      <Tower position={[2.4, 0, 0.2]} height={6.8} radius={0.9} stone={stone} roof={roof} />
      <Tower position={[-1.6, 0, -2.2]} height={3.8} radius={0.7} stone={stone} roof={roof} />
      <Keep position={[0.3, 0, -0.4]} height={5.2} radius={1.2} stone={stone} roof={roof} />
      <Gate position={[0.2, 0, 2.6]} width={1.5} height={2.3} stone={stone} />
      <Banner position={[2.4, 7.6, 0.2]} color="#8c2d32" seed={4} />
    </group>
  )
}

function RiverCastle() {
  const stone = '#d4cfc2'
  const roof = '#2f6168'
  return (
    <group>
      <Wall position={[0, 1, 0]} size={[7.2, 2, 3.6]} stone={stone} />
      <Tower position={[-3, 0, 0.2]} height={4.4} radius={0.62} stone={stone} roof={roof} />
      <Tower position={[3, 0, 0.2]} height={5.1} radius={0.62} stone={stone} roof={roof} />
      <Keep position={[0, 0, -0.3]} height={4.6} radius={1} stone={stone} roof={roof} />
      <Gate position={[0, 0, 1.9]} width={1.7} height={1.9} stone={stone} />
      <Banner position={[-3, 5.2, 0.2]} color="#2a6d74" seed={5} />
      <Banner position={[3, 5.9, 0.2]} color="#d7c27a" seed={6} />
    </group>
  )
}

function FortressCastle() {
  const stone = '#4a4e4c'
  const roof = '#6a1e2c'
  return (
    <group>
      <Wall position={[0, 1.8, 0]} size={[8, 3.6, 6.4]} stone={stone} />
      <Tower position={[-3.4, 0, 2.6]} height={6.2} radius={0.85} stone={stone} roof={roof} />
      <Tower position={[3.4, 0, 2.6]} height={6.4} radius={0.85} stone={stone} roof={roof} />
      <Tower position={[-3.4, 0, -2.6]} height={7} radius={0.8} stone={stone} roof={roof} />
      <Tower position={[3.4, 0, -2.6]} height={6.6} radius={0.8} stone={stone} roof={roof} />
      <Keep position={[0, 0, -0.4]} height={8.2} radius={1.35} stone={stone} roof={roof} />
      <Gate position={[0, 0, 3.3]} width={1.8} height={2.8} stone={'#3e3532'} />
      <Banner position={[-3.4, 7.2, 2.6]} color="#7a2030" seed={7} />
      <Banner position={[3.4, 7.4, 2.6]} color="#7a2030" seed={8} />
      <Banner position={[0, 9.2, -0.4]} color="#d4b15a" seed={9} />
    </group>
  )
}

function MageCastle() {
  const stone = '#6d7390'
  const roof = '#243056'
  return (
    <group>
      <Tower position={[-1.8, 0, 1.2]} height={3.4} radius={0.55} stone={stone} roof={roof} />
      <Tower position={[1.8, 0, 1.2]} height={3.6} radius={0.55} stone={stone} roof={roof} />
      <Keep position={[0, 0, -0.2]} height={11} radius={1.15} stone={stone} roof={roof} />
      <Gate position={[0, 0, 1.7]} width={1.3} height={2.2} stone={stone} />
      <Crystal position={[-1.1, 6.2, 0.4]} />
      <Crystal position={[1.2, 7.4, -0.6]} scale={1.3} />
      <Crystal position={[0.2, 9.6, 0.8]} scale={0.7} />
      <Banner position={[0, 12, -0.2]} color="#49b7ff" seed={10} />
      <pointLight position={[0, 7, 0]} color="#7ad7ff" intensity={0.8} distance={14} />
    </group>
  )
}

function IvoryCastle() {
  const stone = '#f3ecdf'
  const roof = '#c6a15a'
  return (
    <group>
      <Wall position={[0, 1.5, 0]} size={[6.4, 3, 5.2]} stone={stone} />
      <Tower position={[-2.5, 0, 2]} height={6.2} radius={0.58} stone={stone} roof={roof} />
      <Tower position={[2.5, 0, 2]} height={6.6} radius={0.58} stone={stone} roof={roof} />
      <Tower position={[-2.2, 0, -2]} height={5.4} radius={0.55} stone={stone} roof={roof} />
      <Tower position={[2.2, 0, -2]} height={5.8} radius={0.55} stone={stone} roof={roof} />
      <Keep position={[0, 0, -0.2]} height={7.4} radius={1.05} stone={stone} roof={roof} />
      <Gate position={[0, 0, 2.7]} width={1.5} height={2.5} stone={stone} />
      <Banner position={[-2.5, 7.2, 2]} color="#f4efe4" seed={11} />
      <Banner position={[2.5, 7.6, 2]} color="#d4b15a" seed={12} />
    </group>
  )
}
