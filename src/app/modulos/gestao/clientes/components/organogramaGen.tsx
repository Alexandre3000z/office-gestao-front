import React, { useEffect, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MarkerType,
} from "reactflow";
import * as dagre from "dagre";
import "reactflow/dist/style.css";

import {
  SocioEmpresaCompleta,
  convertDataToReactFlowNodesEdges,
} from "../services/dataReactFlowNodeEdges";

const nodeWidth = 180;
const nodeHeight = 80;

const corSocio = "#3b82f6"; // azul médio
const corEmpresaVinculada = "#10b981"; // verde

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  rootEmpresaId: string,
  direction = "TB"
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 50,
    ranksep: 80,
    marginx: 10,
    marginy: 10,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    let y = nodeWithPosition.y - nodeHeight / 2;

    // Força a empresa principal a ficar no topo
    if (node.id === rootEmpresaId) {
      const menorY = Math.min(...nodes.map((n) => dagreGraph.node(n.id).y));
      y = menorY - 100;
    }

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y,
      },
      draggable: false,
    };
  });

  return { nodes: layoutedNodes, edges };
};

interface OrganogramaProps {
  data: SocioEmpresaCompleta;
}

export default function Organograma({ data }: OrganogramaProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    // Sempre gerar novos dados do zero quando `data` mudar
    const { nodes: rawNodes, edges: rawEdges } =
      convertDataToReactFlowNodesEdges(data);

    const rootEmpresaId = `empresa-${data.codi_emp}`;

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      rawNodes,
      rawEdges,
      rootEmpresaId
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const onNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
  };

  const styledEdges = edges.map((edge) => {
    const isConnected =
      edge.source === selectedNodeId || edge.target === selectedNodeId;

    let corEdge = "#bbb";

    // Identifica a cor pela origem (source)
    if (edge.source.startsWith("empresa-")) corEdge = corSocio;
    else if (edge.source.startsWith("socio-")) corEdge = corEmpresaVinculada;
    return {
      ...edge,
      animated: isConnected,
      style: {
        stroke: isConnected ? corEdge : "#bbb",
        strokeWidth: isConnected ? 2.5 : 1.5,
        opacity: isConnected ? 1 : 0.3,
        filter: isConnected ? `drop-shadow(0 0 4px ${corEdge})` : "none",
      },
      markerEnd: {
        type: MarkerType.Arrow,
        color: isConnected ? corEdge : "#bbb",
      },
      zIndex: isConnected ? 1000 : 0,
    };
  });

  return (
    <div className="border w-full h-[75vh]">
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
